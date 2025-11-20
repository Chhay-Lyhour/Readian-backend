import express from "express";
import {
  rateBook,
  getMyRating,
  deleteRating,
  getBookRatings,
} from "../controllers/ratingController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/books/:bookId/rate
 * @desc Rate a book (1-5 stars)
 * @access Private
 */
router.post("/:bookId/rate", requireAuth, rateBook);

/**
 * @route GET /api/books/:bookId/rating/me
 * @desc Get current user's rating for a book
 * @access Private
 */
router.get("/:bookId/rating/me", requireAuth, getMyRating);

/**
 * @route DELETE /api/books/:bookId/rate
 * @desc Delete user's rating for a book
 * @access Private
 */
router.delete("/:bookId/rate", requireAuth, deleteRating);

/**
 * @route GET /api/books/:bookId/ratings
 * @desc Get all ratings for a book (paginated, public)
 * @access Public
 */
router.get("/:bookId/ratings", getBookRatings);

export default router;

