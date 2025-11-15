import { Router } from "express";
import * as controller from "../controllers/chapterController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import { validateRequestBody } from "../middlewares/requestValidatorMiddleware.js";
import {
  createChapterSchema,
  updateChapterSchema,
} from "../dto/chapterValidationSchemas.js";

const router = Router();

// All chapter routes require authentication and AUTHOR or ADMIN role
router.use(requireAuth, requireRole(["AUTHOR", "ADMIN"]));

router.post(
  "/books/:bookId/chapters",
  validateRequestBody(createChapterSchema),
  controller.createChapter
);

router.get("/chapters/:chapterId", controller.getChapter);

router.patch(
  "/chapters/:chapterId",
  validateRequestBody(updateChapterSchema),
  controller.updateChapter
);

router.delete("/chapters/:chapterId", controller.deleteChapter);

export default router;
