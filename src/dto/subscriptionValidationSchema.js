import { z } from "zod";

// This schema ensures the request body has a 'plan' field
// that is either 'basic' or 'premium', and optionally a 'duration' field.
const planSchema = z.object({
  plan: z.enum(["basic", "premium"], {
    required_error: "A plan type (basic or premium) is required.",
  }),
  duration: z.number().int().min(1).max(3650).optional().default(30), // Duration in days (1 day to 10 years), defaults to 30
});

export { planSchema };
