import { Router } from "express";
import { chapterController } from "../controllers/chapterController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import { validateRequestBody } from "../middlewares/requestValidatorMiddleware.js";
import {
  createChapterSchema,
  updateChapterSchema,
} from "../dto/chapterValidationSchemas.js";

const router = Router();

// All routes in this file require author or admin role
router.use(requireAuth, requireRole(["AUTHOR", "ADMIN"]));

// Create a new chapter for a book
router.post(
  "/books/:bookId/chapters",
  validateRequestBody(createChapterSchema),
  chapterController.createChapter
);

// Get all chapters for a book
router.get("/books/:bookId/chapters", chapterController.getChaptersByBook);

// Get a single chapter by its ID
router.get("/chapters/:chapterId", chapterController.getChapterById);

// Update a chapter
router.patch(
  "/chapters/:chapterId",
  validateRequestBody(updateChapterSchema),
  chapterController.updateChapter
);

// Delete a chapter
router.delete("/chapters/:chapterId", chapterController.deleteChapter);

export default router;
