import BookModel from "../models/bookModel.js";
import { AppError } from "../utils/errorHandler.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

/**
 * Rate a book (1-5 stars)
 * @route POST /api/books/:bookId/rate
 */
export const rateBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError(
        "INVALID_RATING",
        "Rating must be between 1 and 5",
        400
      );
    }

    // Find the book
    const book = await BookModel.findById(bookId);

    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", "Book not found", 404);
    }

    // Check if book is published
    if (book.status !== "published") {
      throw new AppError(
        "BOOK_NOT_PUBLISHED",
        "You can only rate published books",
        400
      );
    }

    // Check if user already rated this book
    const existingRatingIndex = book.ratings.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      book.ratings[existingRatingIndex].rating = rating;
      book.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      book.ratings.push({
        user: userId,
        rating: rating,
        createdAt: new Date(),
      });
    }

    // Calculate average rating
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((sum, r) => sum + r.rating, 0);
    book.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    book.totalRatings = totalRatings;

    await book.save();

    sendSuccessResponse(
      res,
      {
        averageRating: book.averageRating.toFixed(1),
        totalRatings: book.totalRatings,
        yourRating: rating,
      },
      existingRatingIndex !== -1
        ? "Rating updated successfully"
        : "Rating added successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's rating for a book
 * @route GET /api/books/:bookId/rating/me
 */
export const getMyRating = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = await BookModel.findById(bookId).select("ratings");

    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", "Book not found", 404);
    }

    const userRating = book.ratings.find(
      (r) => r.user.toString() === userId
    );

    sendSuccessResponse(
      res,
      {
        rating: userRating ? userRating.rating : null,
        ratedAt: userRating ? userRating.createdAt : null,
      },
      userRating ? "Rating retrieved successfully" : "You haven't rated this book yet"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user's rating for a book
 * @route DELETE /api/books/:bookId/rate
 */
export const deleteRating = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = await BookModel.findById(bookId);

    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", "Book not found", 404);
    }

    // Find and remove user's rating
    const ratingIndex = book.ratings.findIndex(
      (r) => r.user.toString() === userId
    );

    if (ratingIndex === -1) {
      throw new AppError(
        "RATING_NOT_FOUND",
        "You haven't rated this book",
        404
      );
    }

    book.ratings.splice(ratingIndex, 1);

    // Recalculate average rating
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((sum, r) => sum + r.rating, 0);
    book.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    book.totalRatings = totalRatings;

    await book.save();

    sendSuccessResponse(
      res,
      {
        averageRating: book.averageRating.toFixed(1),
        totalRatings: book.totalRatings,
      },
      "Rating deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all ratings for a book (with pagination)
 * @route GET /api/books/:bookId/ratings
 */
export const getBookRatings = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const book = await BookModel.findById(bookId)
      .select("ratings averageRating totalRatings title")
      .populate({
        path: "ratings.user",
        select: "name avatar email",
      });

    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", "Book not found", 404);
    }

    // Sort ratings by date (most recent first)
    const sortedRatings = book.ratings.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Paginate
    const paginatedRatings = sortedRatings.slice(skip, skip + limit);

    sendSuccessResponse(
      res,
      {
        bookTitle: book.title,
        averageRating: parseFloat(book.averageRating.toFixed(1)),
        totalRatings: book.totalRatings,
        ratings: paginatedRatings.map((r) => ({
          user: {
            id: r.user._id,
            name: r.user.name,
            avatar: r.user.avatar,
          },
          rating: r.rating,
          ratedAt: r.createdAt,
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(book.totalRatings / limit),
          totalRatings: book.totalRatings,
          limit,
        },
      },
      "Book ratings retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

