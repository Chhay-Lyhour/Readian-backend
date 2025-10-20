// File: src/services/auth.service.ts
import bcrypt from "bcryptjs";
import { Logger } from "../utils/logger";
import { AppError } from "../utils/errorHandler";
import * as jwt from "./jwt.service";
import * as email from "./email.service";
import * as repo from "../repositories/auth.repository";
import type * as schemas from "../schemas/auth.schema";
import { config } from "../config/config";

const BCRYPT_SALT_ROUNDS = parseInt(config.bcryptSaltRounds);

// --- Registration ---
export async function registerUser(data: schemas.RegisterRequest) {
  if (await repo.findUserByEmail(data.email)) throw new AppError("EMAIL_ALREADY_EXISTS");
  const password = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
  const newUser = await repo.createUser({ ...data, password });
  await email.sendVerificationEmail(newUser.email, newUser.name);
  return {
    message: "Registration successful. Please check your email.",
    userId: newUser._id,
  };
}

export async function loginUser(data: schemas.LoginRequest): Promise<schemas.AuthResponse> {
  const user = await repo.findUserByEmail(data.email, true); // Important: include password
  if (!user || !(await bcrypt.compare(data.password!, user.password!)))
    throw new AppError("INVALID_CREDENTIALS");
  if (!user.email_verified) throw new AppError("EMAIL_NOT_VERIFIED");

  const tokens = jwt.generateTokenPair(user._id.toString(), user.email, user.role);
  await repo.saveRefreshToken(user._id, tokens.refreshToken);
  await repo.updateUserLastLogin(user._id);

  const userProfile = user.toObject();
  delete userProfile.password;

  return { user: userProfile as schemas.UserProfile, tokens };
}

// ... (Copy the rest of the functions from your original auth.service.ts)
// The logic remains the same. You are calling the repository functions we just created.
// For example, in `verifyEmail`, `user.id` will now be `user._id`.
