import { Router } from "express";
import * as controller from "../controllers/bookController.js";
import {
  requireAuth,
  requireRole,
  softAuth,
} from "../middlewares/authMiddleware.js";
import { validateRequestBody } from "../middlewares/requestValidatorMiddleware.js";
import {
  createBookSchema,
  updateBookSchema,
} from "../dto/bookValidationSchemas.js";

const router = Router();

// --- Public Route ---
// Anyone can get a list of all books.
router.get("/", controller.getAllBooks);

// --- "Soft" Authenticated Route ---
// This route now uses `softAuth`. If a user is logged in, their details are
// attached to the request. If not, the request proceeds as anonymous.
// The service layer will handle the subscription check.
router.get("/:id", softAuth, controller.getBookById);

// --- Protected Routes (AUTHOR or ADMIN) ---
// These actions require a valid token and specific roles.
router.post(
  "/",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  validateRequestBody(createBookSchema),
  controller.createBook
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  validateRequestBody(updateBookSchema),
  controller.updateBook
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  controller.deleteBook
);

export default router;
