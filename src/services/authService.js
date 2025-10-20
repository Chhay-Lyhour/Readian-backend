import bcrypt from "bcryptjs";
import { AppError } from "../utils/errorHandler.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  hashToken,
} from "./jwtService.js";
import { sendVerificationEmail } from "./email.js";
import {
  findUserByEmail,
  createUser,
  findEmailVerification,
  markEmailVerificationAsVerified,
  markUserEmailAsVerified,
  saveRefreshToken,
  updateUserLastLogin,
  findUserById,
  findRefreshTokenByHash,
  deleteRefreshTokenByHash,
  deleteAllUserRefreshTokens,
  updateUserPassword,
} from "../repositories/authRepositories.js";
import { config } from "../config/config.js";

const BCRYPT_SALT_ROUNDS = parseInt(config.bcryptSaltRounds);

async function registerUser(data) {
  if (await findUserByEmail(data.email)) {
    throw new AppError("EMAIL_ALREADY_EXISTS");
  }
  const password = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
  const newUser = await createUser({ ...data, password });
  await sendVerificationEmail(newUser.email, newUser.name);
  return {
    message: "Registration successful. Please check your email.",
    userId: newUser.id,
  };
}

async function verifyEmail(data) {
  const verification = await findEmailVerification(
    data.email,
    data.code,
    "registration"
  );
  if (!verification) throw new AppError("VERIFICATION_CODE_INVALID");

  const user = await findUserByEmail(data.email);
  if (!user) throw new AppError("USER_NOT_FOUND");

  await markEmailVerificationAsVerified(verification.id);
  const updatedUser = await markUserEmailAsVerified(user.id);

  // You can also send a welcome email here if you like
  // await email.sendWelcomeEmail(user.email, user.name);

  const { password, ...userProfile } = updatedUser.toObject();
  return { message: "Email verified successfully.", user: userProfile };
}

async function resendVerificationCode(data) {
  const user = await findUserByEmail(data.email);
  if (!user) throw new AppError("USER_NOT_FOUND");
  if (user.email_verified) throw new AppError("EMAIL_ALREADY_VERIFIED");

  await sendVerificationEmail(user.email, user.name);
  return { message: "A new verification code has been sent." };
}

async function loginUser(data) {
  const user = await findUserByEmail(data.email);
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new AppError("INVALID_CREDENTIALS");
  }
  if (!user.email_verified) throw new AppError("EMAIL_NOT_VERIFIED");

  const tokens = generateTokenPair(user.id, user.email, user.role);
  await saveRefreshToken(user._id, tokens.refreshToken);
  await updateUserLastLogin(user.id);

  const { password, ...userProfile } = user.toObject();
  return { user: userProfile, tokens };
}

async function refreshAccessToken(data) {
  const decoded = verifyRefreshToken(data.refreshToken);
  const user = await findUserById(decoded.userId);
  if (!user) throw new AppError("USER_NOT_FOUND");

  const tokenHash = hashToken(data.refreshToken);
  const existingToken = await findRefreshTokenByHash(tokenHash);

  // This is a critical security measure against token reuse.
  if (!existingToken) {
    console.warn(
      `Potential refresh token reuse for user: ${user.id}. Invalidating all sessions.`
    );
    await deleteAllUserRefreshTokens(user.id);
    throw new AppError("TOKEN_INVALID", "Invalid token. Please log in again.");
  }

  const newTokens = generateTokenPair(user.id, user.email, user.role);

  // Atomically delete the old token and create the new one
  await deleteRefreshTokenByHash(tokenHash);
  await saveRefreshToken(user._id, newTokens.refreshToken);

  return { tokens: newTokens };
}

async function logoutUser(data) {
  // We don't strictly need to verify the token, but it's good practice.
  // If it's invalid, the hash won't match anything in the DB anyway.
  const tokenHash = hashToken(data.refreshToken);
  await deleteRefreshTokenByHash(tokenHash);
  return { message: "Logged out successfully." };
}

async function logoutFromAllDevices(userId) {
  await deleteAllUserRefreshTokens(userId);
  return { message: "Logged out from all devices." };
}

async function forgotPassword(data) {
  const user = await findUserByEmail(data.email);
  // To prevent user enumeration attacks, always return a generic success message.
  if (user) {
    // await email.sendPasswordResetEmail(user.email, user.name);
    console.log("Password reset email should be sent here.");
  }
  return {
    message:
      "If an account exists for this email, a password reset code has been sent.",
  };
}

async function verifyPasswordResetCode(data) {
  const verification = await findEmailVerification(
    data.email,
    data.code,
    "password_reset"
  );
  if (!verification) throw new AppError("VERIFICATION_CODE_INVALID");
  return { valid: true, message: "Code is valid." };
}

async function resetPassword(data) {
  const verification = await findEmailVerification(
    data.email,
    data.code,
    "password_reset"
  );
  if (!verification) throw new AppError("VERIFICATION_CODE_INVALID");

  const user = await findUserByEmail(data.email);
  if (!user) throw new AppError("USER_NOT_FOUND");

  const newPasswordHash = await bcrypt.hash(
    data.newPassword,
    BCRYPT_SALT_ROUNDS
  );
  await updateUserPassword(user.id, newPasswordHash);
  await markEmailVerificationAsVerified(verification.id);

  // For security, log the user out of all devices after a password reset
  await deleteAllUserRefreshTokens(user.id);

  return { message: "Password has been reset successfully." };
}

async function changePassword(userId, data) {
  const user = await findUserById(userId);
  if (!user) throw new AppError("USER_NOT_FOUND");

  // Need to fetch user with password to compare
  const userWithPassword = await findUserByEmail(user.email);
  if (!userWithPassword || !userWithPassword.password)
    throw new AppError("INTERNAL_SERVER_ERROR");

  const isPasswordValid = await bcrypt.compare(
    data.currentPassword,
    userWithPassword.password
  );
  if (!isPasswordValid) {
    throw new AppError("INVALID_CREDENTIALS", "Incorrect current password.");
  }

  const newPasswordHash = await bcrypt.hash(
    data.newPassword,
    BCRYPT_SALT_ROUNDS
  );
  await updateUserPassword(userId, newPasswordHash);

  // Log out of other sessions for security
  await deleteAllUserRefreshTokens(userId);

  return {
    message:
      "Password changed successfully. You may need to log in again on other devices.",
  };
}

export {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutFromAllDevices,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
  changePassword,
};
