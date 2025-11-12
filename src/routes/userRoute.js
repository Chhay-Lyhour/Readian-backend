import { Router } from "express";
import * as controller from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import { validateRequestBody } from "../middlewares/requestValidatorMiddleware.js";
import * as schemas from "../dto/userValidationSchemas.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";

export const userRouter = Router();

// All routes in this file will require a user to be authenticated
userRouter.use(requireAuth);

// A regular user can update their own profile
userRouter.patch(
  "/me",
  validateRequestBody(schemas.updateProfileSchema),
  controller.updateCurrentUserProfile
);

// A user can update their own profile image
userRouter.patch(
  "/me/profile-image",
  uploadSingleImage("avatar"),
  controller.updateProfileImage
);

// A logged-in user (who is a BUYER) can upgrade their role to AUTHOR
userRouter.post("/me/become-author", controller.becomeAuthor);

userRouter.get(
  "/me/books",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  controller.getMyBooks
);

userRouter.get(
  "/me/author-stats",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  controller.getAuthorStats
);

userRouter.get("/me/liked-books", requireAuth, controller.getLikedBooks);

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
