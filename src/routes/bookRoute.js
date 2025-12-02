import { Router } from "express";
import * as controller from "../controllers/bookController.js";
import * as chapterController from "../controllers/chapterController.js";
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
  chapterPaginationQuerySchema,
  updateBookStatusSchema,
  updateContentTypeSchema,
} from "../dto/bookValidationSchemas.js";
import {
  addChapterSchema,
  updateChapterSchema,
  reorderChaptersSchema,
} from "../dto/chapterValidationSchemas.js";
import * as likeController from "../controllers/likeController.js";
import { checkAgeRestriction } from "../middlewares/ageRestrictionMiddleware.js";

const router = Router();

// --- Public Route ---
// Anyone can get a list of all books.
router.get(
  "/",
  softAuth,
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
// The service layer will handle the subscription check and age restriction.
router.get(
  "/:id",
  softAuth,
  validateRequestQuery(chapterPaginationQuerySchema),
  controller.getBookById
);

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

router.post(
  "/:id/toggle-premium",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  controller.togglePremium
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  validateRequestBody(updateBookStatusSchema),
  controller.updateBookStatus
);

router.patch(
  "/:id/content-type",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  validateRequestBody(updateContentTypeSchema),
  controller.updateContentType
);

// --- Like/Unlike Routes ---
router.post("/:id/like", requireAuth, likeController.likeBook);
router.post("/:id/unlike", requireAuth, likeController.unlikeBook);

// --- Chapter Routes ---
// Get all chapters for a book
router.get(
  "/:id/chapters",
  softAuth,
  checkAgeRestriction,
  validateRequestQuery(chapterPaginationQuerySchema),
  controller.getBookChapters
);

// Get a specific chapter by chapter number
router.get(
  "/:id/chapters/:chapterNumber",
  softAuth,
  checkAgeRestriction,
  controller.getChapterByNumber
);

// --- Chapter Management Routes (AUTHOR or ADMIN only) ---
// Add a new chapter to a book
router.post(
  "/:bookId/chapters",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  validateRequestBody(addChapterSchema),
  chapterController.addChapter
);

// Update a specific chapter
router.patch(
  "/:bookId/chapters/:chapterNumber",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  validateRequestBody(updateChapterSchema),
  chapterController.updateChapter
);

// Delete a specific chapter
router.delete(
  "/:bookId/chapters/:chapterNumber",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  chapterController.deleteChapter
);

// Reorder chapters
router.post(
  "/:bookId/chapters/reorder",
  requireAuth,
  requireRole(["AUTHOR", "ADMIN"]),
  validateRequestBody(reorderChaptersSchema),
  chapterController.reorderChapters
);

export default router;
