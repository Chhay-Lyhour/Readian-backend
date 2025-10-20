// File: src/repositories/auth.repository.ts
import { UserModel } from "../models/user.model";
import { RefreshTokenModel } from "../models/refreshToken.model";
import { EmailVerificationModel } from "../models/emailVerification.model";
import { hashToken } from "../service/jwt.service";
import { config } from "../config/config";
import { UserRole } from "../types/enums";

const JWT_REFRESH_EXPIRY = parseInt(config.jwtRefreshExpiry);

// --- Types ---
interface NewUser {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

// --- User Repo ---
export const createUser = async (data: NewUser) => {
  // Note: We include `select: '+password'` when we need the password
  const user = new UserModel(data);
  return await user.save();
};

export async function findUserByEmail(email: string, includePassword = false) {
  const query = UserModel.findOne({ email });
  if (includePassword) {
    query.select("+password");
  }
  return await query.exec();
}

export const findUserById = async (id: string) => {
  return await UserModel.findById(id).exec();
};

export const markUserEmailAsVerified = async (id: string) => {
  return await UserModel.findByIdAndUpdate(
    id,
    { email_verified: true },
    { new: true }
  ).exec();
};

export const updateUserLastLogin = async (id: string) => {
  await UserModel.findByIdAndUpdate(id, { last_login: new Date() }).exec();
};

export async function updateUserPassword(
  userId: string,
  newPasswordHash: string
) {
  return await UserModel.findByIdAndUpdate(
    userId,
    { password: newPasswordHash },
    { new: true }
  ).exec();
}

// --- Refresh Token Repo ---
export const saveRefreshToken = async (userId: string, token: string) => {
  const data = {
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + JWT_REFRESH_EXPIRY * 1000),
  };
  return await RefreshTokenModel.create(data);
};

export const findRefreshTokenByHash = async (token_hash: string) => {
  return await RefreshTokenModel.findOne({ token_hash }).exec();
};

export const deleteRefreshTokenByHash = async (token_hash: string) => {
  await RefreshTokenModel.deleteMany({ token_hash }).exec();
};

export const deleteAllUserRefreshTokens = async (user_id: string) => {
  await RefreshTokenModel.deleteMany({ user_id }).exec();
};

export const rotateRefreshToken = async (
  oldTokenHash: string,
  newToken: string,
  userId: string
) => {
  await deleteRefreshTokenByHash(oldTokenHash);
  await saveRefreshToken(userId, newToken);
};

// --- Email Verification Repo ---
export const createEmailVerification = async (
  email: string,
  code: string,
  type: "registration" | "password_reset"
) => {
  await EmailVerificationModel.deleteMany({ email, type });
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return await EmailVerificationModel.create({ email, code, expires_at, type });
};

export async function findEmailVerificationByCode(
  email: string,
  code: string,
  type: "registration" | "password_reset"
) {
  return await EmailVerificationModel.findOne({
    email,
    code,
    type,
    verified: false,
    expires_at: { $gte: new Date() },
  }).exec();
}

export const markEmailVerificationAsVerified = async (id: string) => {
  await EmailVerificationModel.findByIdAndUpdate(id, { verified: true }).exec();
};
