import { z } from "zod";

// For: PATCH /api/users/me (a user updating their own profile)
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  age: z.number().int().min(0, "Age must be at least 0").max(150, "Age cannot exceed 150").optional(),
});

// For: POST /api/users/me/change-password
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters"),
});

// For: PATCH /api/users/:id (an admin updating any user)
export const updateUserByAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["READER", "AUTHOR", "ADMIN"]).optional(),
  email_verified: z.boolean().optional(),
});
