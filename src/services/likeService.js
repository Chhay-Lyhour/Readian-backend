import BookModel from "../models/bookModel.js";
import { User as UserModel } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";
import mongoose from "mongoose";

/**
 * Likes a book for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} bookId - The ID of the book.
 */
export async function likeBook(userId, bookId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const book = await BookModel.findById(bookId).session(session);
    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", "Book not found.");
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found.");
    }

    // Age restriction check for adult content
    if (book.contentType === "adult") {
      if (!user.age && user.age !== 0) {
        throw new AppError("AGE_NOT_SET", "Please set your age in your profile to like this content.");
      }
      if (user.age < 18) {
        throw new AppError("AGE_RESTRICTED", "You must be 18 years or older to like adult content.");
      }
    }

    // Convert userId to ObjectId for proper comparison
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const bookIdObjectId = new mongoose.Types.ObjectId(bookId);

    // Check if user already liked this book (using ObjectId comparison)
    const alreadyLiked = book.likedBy.some(
      (id) => id.toString() === userIdObjectId.toString()
    );
    if (alreadyLiked) {
      throw new AppError("ALREADY_LIKED", "You have already liked this book.");
    }

    book.likes += 1;
    book.likedBy.push(userIdObjectId);
    user.likedBooks.push(bookIdObjectId);

    await book.save({ session });
    await user.save({ session });

    await session.commitTransaction();
    return { message: "Book liked successfully." };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Unlikes a book for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} bookId - The ID of the book.
 */
export async function unlikeBook(userId, bookId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const book = await BookModel.findById(bookId).session(session);
    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", "Book not found.");
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found.");
    }

    // Age restriction check for adult content
    if (book.contentType === "adult") {
      if (!user.age && user.age !== 0) {
        throw new AppError("AGE_NOT_SET", "Please set your age in your profile to unlike this content.");
      }
      if (user.age < 18) {
        throw new AppError("AGE_RESTRICTED", "You must be 18 years or older to unlike adult content.");
      }
    }

    // Convert userId to ObjectId for proper comparison
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const bookIdObjectId = new mongoose.Types.ObjectId(bookId);

    // Check if user has liked this book (using ObjectId comparison)
    const hasLiked = book.likedBy.some(
      (id) => id.toString() === userIdObjectId.toString()
    );
    if (!hasLiked) {
      throw new AppError("NOT_LIKED", "You have not liked this book.");
    }

    book.likes -= 1;
    book.likedBy.pull(userIdObjectId);
    user.likedBooks.pull(bookIdObjectId);

    await book.save({ session });
    await user.save({ session });

    await session.commitTransaction();
    return { message: "Book unliked successfully." };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
