import { AppError } from "../utils/errorHandler.js";
import BookModel from "../models/bookModel.js";

/**
 * Middleware to check if user can access adult content based on their age
 * This middleware should be used after requireAuth or softAuth
 */
export const checkAgeRestriction = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const user = req.user;

    // Get the book to check its content type
    const book = await BookModel.findById(bookId).select("contentType").lean();

    if (!book) {
      return next(new AppError("BOOK_NOT_FOUND", "Book not found."));
    }

    // If it's kids content, anyone can access (even not logged in users)
    if (book.contentType === "kids") {
      return next();
    }

    // If it's adult content, user must be logged in
    if (book.contentType === "adult") {
      if (!user) {
        return next(
          new AppError(
            "AUTHENTICATION_REQUIRED",
            "You must be logged in to access adult content."
          )
        );
      }

      // User must have set their age
      if (!user.age && user.age !== 0) {
        return next(
          new AppError(
            "AGE_NOT_SET",
            "Please set your age in your profile to access this content."
          )
        );
      }

      // User must be 18 or older
      if (user.age < 18) {
        return next(
          new AppError(
            "AGE_RESTRICTED",
            "You must be 18 years or older to access adult content."
          )
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to filter books based on user age
 * Used in book listing endpoints
 */
export const getAgeBasedBookFilter = (user) => {
  // If user is not logged in or hasn't set age, only show kids content
  if (!user || !user.age) {
    return { contentType: "kids" };
  }

  // If user is under 18, only show kids content
  if (user.age < 18) {
    return { contentType: "kids" };
  }

  // If user is 18+, show all content (no filter needed)
  return {};
};

