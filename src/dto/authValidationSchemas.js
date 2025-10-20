import z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be 8+ characters")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number");
const emailSchema = z.string().email().toLowerCase().trim();
const codeSchema = z.string().length(6).regex(/^\d+$/);

const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2),
});

const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const verifyEmailRequestSchema = z.object({
  email: emailSchema,
  code: codeSchema,
});

// You can add the rest of the schemas from your original project here.
// Zod works perfectly in JavaScript.

export { registerRequestSchema, loginRequestSchema, verifyEmailRequestSchema };
