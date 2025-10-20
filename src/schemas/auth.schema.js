// File: src/schemas/auth.schema.ts
// This file is largely the same as your original, as Zod is framework-agnostic.
import { z } from "zod";
import { UserRole } from "../types/enums";

// --- Reusable Schemas ---
const passwordSchema = z
  .string()
  .min(8, "Password must be 8+ characters")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number");
const emailSchema = z.string().email().toLowerCase().trim();
const codeSchema = z
  .string()
  .length(6)
  .regex(/^\\d+$/);

// --- Request Schemas ---
export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2),
});
// ... (copy all other request schemas from your original file) ...
export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// --- Type Exports ---
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
// ... (copy all other type exports) ...
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

// --- Response Schemas & Types ---
const userProfileSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]),
  email_verified: z.boolean(),
  last_login: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
const tokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;
export type AuthResponse = {
  user: UserProfile,
  tokens: z.infer<typeof tokenSchema>,
};
export type TokenRefreshResponse = { tokens: z.infer<typeof tokenSchema> };
