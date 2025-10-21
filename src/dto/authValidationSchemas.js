import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be 8+ characters")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number");
const emailSchema = z.string().email().toLowerCase().trim();
const codeSchema = z.string().length(6).regex(/^\d+$/);

// You can add the rest of the schemas from your original project here.
// Zod works perfectly in JavaScript.
// For: POST /api/auth/register
const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters"),
});

// For: POST /api/auth/verify-email
const verifyEmailRequestSchema = z.object({
  email: emailSchema,
  code: codeSchema,
});

// For: POST /api/auth/resend-verification
const resendVerificationEmailSchema = z.object({
  email: emailSchema,
});

// For: POST /api/auth/login
const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// For: POST /api/auth/refresh-token and POST /api/auth/logout
const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// For: POST /api/auth/forgot-password
const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

// For: POST /api/auth/verify-reset-code
const verifyResetCodeRequestSchema = z.object({
  email: emailSchema,
  code: codeSchema,
});

// For: POST /api/auth/reset-password
const resetPasswordRequestSchema = z.object({
  email: emailSchema,
  code: codeSchema,
  newPassword: passwordSchema,
});

// For: POST /api/auth/change-password
const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export {
  registerRequestSchema,
  loginRequestSchema,
  verifyEmailRequestSchema,
  refreshTokenRequestSchema,
  changePasswordRequestSchema,
  forgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  resendVerificationEmailSchema,
  verifyResetCodeRequestSchema,
};
