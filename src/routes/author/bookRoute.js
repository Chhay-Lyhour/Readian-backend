import { Router } from "express";
import * as controller from "../../controllers/bookController.js";
import {
  requireAuth,
  requireRole,
} from "../../middlewares/authMiddleware.js";
import {
  validateRequestBody,
} from "../../middlewares/requestValidatorMiddleware.js";
import { uploadSingleImage } from "../../middlewares/uploadMiddleware.js";
import {
  createBookSchema,
  updateBookSchema,
} from "../../dto/bookValidationSchemas.js";

const router = Router();

// --- Protected Routes (AUTHOR or ADMIN) ---
// These actions require a valid token and specific roles.
router.post(
  "/",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  uploadSingleImage("image"),
  validateRequestBody(createBookSchema),
  controller.createBook
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  uploadSingleImage("image"),
  validateRequestBody(updateBookSchema),
  controller.updateBook
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  controller.deleteBook
);

router.post(
  "/:id/publish",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  controller.publishBook
);

export default router;
