import { Router } from "express";
import * as controller from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import { validateRequestBody } from "../middlewares/requestValidatorMiddleware.js";
import * as schemas from "../dto/userValidationSchemas.js";

export const userRouter = Router();

// All routes in this file will require a user to be authenticated
userRouter.use(requireAuth);

// A regular user can update their own profile
userRouter.patch(
  "/me",
  validateRequestBody(schemas.updateProfileSchema),
  controller.updateCurrentUserProfile
);

// --- Admin-Only Routes ---
// The routes below are only accessible to users with the 'ADMIN' role
userRouter.use(requireRole(["ADMIN"]));

userRouter.get("/", controller.getAllUsers);
userRouter.get("/:id", controller.getUserById);
userRouter.patch(
  "/:id",
  validateRequestBody(schemas.updateUserByAdminSchema),
  controller.updateUserByAdmin
);
userRouter.delete("/:id", controller.deleteUser);
