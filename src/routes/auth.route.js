// File: src/routes/auth.route.ts
import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import {
  requireAuth,
  requireRole,
  authRateLimit,
  strictRateLimit,
} from "../middlewares/auth.middleware";
import { UserRole } from "../types/enums"; // Import from your new type
import * as schemas from "../schemas/auth.schema";
import { validateRequestBody } from "../middlewares/validator.middleware"; // Assuming you name it this

const router: Router = Router();

// (This file is identical to your original auth.route.ts, just update the import paths)
// Example route:
router.post(
  "/register",
  authRateLimit,
  validateRequestBody(schemas.registerRequestSchema),
  controller.register
);
// ... all other routes

export const authRouter = router;
