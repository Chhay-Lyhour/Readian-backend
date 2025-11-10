import { z } from "zod";

// This schema ensures the request body has a 'plan' field
// that is either 'basic' or 'premium'.
const planSchema = z.object({
  plan: z.enum(["basic", "premium"], {
    required_error: "A plan type (basic or premium) is required.",
  }),
});

export { planSchema };
