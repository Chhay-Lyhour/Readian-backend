import { z } from "zod";

// For: PATCH /api/users/me (a user updating their own profile)
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  // You can add other editable fields here later, like bio, etc.
});

// For: PATCH /api/users/:id (an admin updating any user)
export const updateUserByAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["READER", "AUTHOR", "ADMIN"]).optional(),
  email_verified: z.boolean().optional(),
});
