import { Router } from "express";
import * as controller from "../controllers/bookController.js";
import {
  requireAuth,
  requireRole,
  softAuth,
} from "../middlewares/authMiddleware.js";
import {
  validateRequestBody,
  validateRequestQuery,
} from "../middlewares/requestValidatorMiddleware.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";
import {
  createBookSchema,
  updateBookSchema,
  searchBookSchema,
  paginationQuerySchema,
} from "../dto/bookValidationSchemas.js";

const router = Router();

// --- Public Route ---
// Anyone can get a list of all books.
router.get(
  "/",
  validateRequestQuery(paginationQuerySchema),
  controller.getAllBooks
);

// --- Search Route ---
router.get(
  "/search",
  softAuth,
  validateRequestQuery(searchBookSchema),
  controller.searchBooks
);

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
