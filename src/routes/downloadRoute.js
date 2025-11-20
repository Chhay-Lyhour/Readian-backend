import express from "express";
import {
  downloadBook,
  getDownloadHistory,
  getDownloadStats,
  getAuthorDownloadAnalytics,
} from "../controllers/downloadController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { verifyPremiumSubscription } from "../middlewares/subscriptionMiddleware.js";
import { checkAgeRestriction } from "../middlewares/ageRestrictionMiddleware.js";
import BookModel from "../models/bookModel.js";
import { AppError } from "../utils/errorHandler.js";

const router = express.Router();

// Custom middleware to check if user is author or has premium subscription
const verifyDownloadPermission = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    // Check if book exists and if user is the author
    const book = await BookModel.findById(bookId).select("author");

    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", "Book not found", 404);
    }

    // If user is the author, allow download without premium check
    if (book.author.toString() === userId) {
      return next();
    }

    // Otherwise, check for premium subscription
    return verifyPremiumSubscription(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/books/:bookId/download
 * @desc Download a book as PDF (Premium subscribers only, or authors can download their own books)
 * @access Private (Premium or Author)
 */
router.get(
  "/books/:bookId/download",
  requireAuth,
  (req, res, next) => {
    // Map bookId to id for age restriction middleware
    req.params.id = req.params.bookId;
    next();
  },
  checkAgeRestriction,
  verifyDownloadPermission,
  downloadBook
);

/**
 * @route GET /api/downloads/history
 * @desc Get download history for current user
 * @access Private
 */
router.get("/downloads/history", requireAuth, getDownloadHistory);

/**
 * @route GET /api/downloads/stats
 * @desc Get download statistics for current user
 * @access Private
 */
router.get("/downloads/stats", requireAuth, getDownloadStats);

/**
 * @route GET /api/author/downloads/analytics
 * @desc Get download analytics for author's books
 * @access Private (Author only)
 */
router.get(
  "/author/downloads/analytics",
  requireAuth,
  getAuthorDownloadAnalytics
);

export default router;

