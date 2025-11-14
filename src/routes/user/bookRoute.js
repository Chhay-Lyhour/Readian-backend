import { Router } from "express";
import * as controller from "../../controllers/bookController.js";
import {
  requireAuth,
  softAuth,
} from "../../middlewares/authMiddleware.js";
import {
  validateRequestQuery,
} from "../../middlewares/requestValidatorMiddleware.js";
import {
  chapterPaginationQuerySchema,
} from "../../dto/bookValidationSchemas.js";
import * as likeController from "../../controllers/likeController.js";

const router = Router();

// --- "Soft" Authenticated Route ---
// This route now uses `softAuth`. If a user is logged in, their details are
// attached to the request. If not, the request proceeds as anonymous.
// The service layer will handle the subscription check.
router.get(
  "/:id",
  softAuth,
  validateRequestQuery(chapterPaginationQuerySchema),
  controller.getBookById
);

// --- Like/Unlike Routes ---
router.post("/:id/like", requireAuth, likeController.likeBook);
router.post("/:id/unlike", requireAuth, likeController.unlikeBook);

export default router;
