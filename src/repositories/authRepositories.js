import { User } from "../models/userModel.js";
import { RefreshToken } from "../models/refreshTokenModel.js";
import { EmailVerification } from "../models/emailVerificationModel.js";
import { hashToken } from "../services/jwtService.js";
import { config } from "../config/config.js";

const JWT_REFRESH_EXPIRY_MS = parseInt(config.jwtRefreshExpiry) * 1000;

const createUser = async (userData) => {
  const user = new User(userData);
  return user.save();
};

const findUserByEmail = async (email) => {
  // Explicitly include the password field which is hidden by default in the schema
  return User.findOne({ email }).select("+password");
};

const findUserById = async (id) => {
  return User.findById(id);
};

const markUserEmailAsVerified = async (id) => {
  return User.findByIdAndUpdate(id, { email_verified: true }, { new: true });
};

const updateUserLastLogin = async (id) => {
  return User.findByIdAndUpdate(id, { last_login: new Date() });
};

const saveRefreshToken = async (userId, token) => {
  const refreshToken = new RefreshToken({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + JWT_REFRESH_EXPIRY_MS),
  });
  return refreshToken.save();
};

const findRefreshTokenByHash = async (tokenHash) => {
  return RefreshToken.findOne({ token_hash: tokenHash });
};

const deleteRefreshTokenByHash = async (tokenHash) => {
  return RefreshToken.deleteOne({ token_hash: tokenHash });
};

const deleteAllUserRefreshTokens = async (userId) => {
  return RefreshToken.deleteMany({ user_id: userId });
};

const createEmailVerification = async (email, code, type) => {
  // Delete existing verifications for this email and type
  await EmailVerification.deleteMany({ email, type });

  const verification = new EmailVerification({
    email,
    code,
    type,
    expires_at: new Date(
      Date.now() + parseInt(config.emailVerificationExpiry) * 1000
    ), // 15 mins
  });
  return verification.save();
};

const findEmailVerification = async (email, code, type) => {
  return EmailVerification.findOne({
    email,
    code,
    type,
    verified: false,
    expires_at: { $gte: new Date() }, // Code is not expired
  });
};

const markEmailVerificationAsVerified = async (id) => {
  return EmailVerification.findByIdAndUpdate(id, { verified: true });
};

const updateUserPassword = async (id, passwordHash) => {
  return User.findByIdAndUpdate(id, { password: passwordHash }, { new: true });
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  markUserEmailAsVerified,
  updateUserLastLogin,
  saveRefreshToken,
  findRefreshTokenByHash,
  deleteRefreshTokenByHash,
  deleteAllUserRefreshTokens,
  createEmailVerification,
  findEmailVerification,
  markEmailVerificationAsVerified,
  updateUserPassword,
};
