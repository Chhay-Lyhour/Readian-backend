import BookModel from "../models/bookModel.js";
import ChapterModel from "../models/chapterModel.js";
import { AppError } from "../utils/errorHandler.js";
import { calculateReadingTime } from "../utils/readingTimeCalculator.js";
import mongoose from "mongoose";

/**
 * Adds a new chapter to a book.
 * @param {string} bookId - The ID of the book.
 * @param {object} chapterData - The data for the new chapter (title, content).
 * @param {string} authorId - The ID of the author making the request.
 */
export async function addChapterToBook(bookId, chapterData, authorId) {
  const book = await BookModel.findById(bookId);

  if (!book) {
    throw new AppError("BOOK_NOT_FOUND");
  }

  // Check if the user is the author of the book
  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  // Get the current highest chapter number
  const lastChapter = await ChapterModel.findOne({ book: bookId })
    .sort({ chapterNumber: -1 })
    .limit(1);

  const newChapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;

  // Create the new chapter
  const chapter = new ChapterModel({
    ...chapterData,
    book: bookId,
    chapterNumber: newChapterNumber,
  });

  await chapter.save();

  // Update reading time for the book
  const allChapters = await ChapterModel.find({ book: bookId });
  const totalContent = allChapters.map((c) => c.content).join(" ");
  book.readingTime = calculateReadingTime(totalContent);
  await book.save();

  return chapter;
}

/**
 * Updates a specific chapter.
 * @param {string} bookId - The ID of the book.
 * @param {number} chapterNumber - The chapter number to update.
 * @param {object} updateData - The data to update (title, content).
 * @param {string} authorId - The ID of the author making the request.
 */
export async function updateChapter(bookId, chapterNumber, updateData, authorId) {
  const book = await BookModel.findById(bookId);

  if (!book) {
    throw new AppError("BOOK_NOT_FOUND");
  }

  // Check if the user is the author of the book
  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  // Find and update the chapter
  const chapter = await ChapterModel.findOneAndUpdate(
    { book: bookId, chapterNumber: chapterNumber },
    updateData,
    { new: true }
  );

  if (!chapter) {
    throw new AppError("CHAPTER_NOT_FOUND", "Chapter not found.");
  }

  // Update reading time for the book if content was changed
  if (updateData.content) {
    const allChapters = await ChapterModel.find({ book: bookId });
    const totalContent = allChapters.map((c) => c.content).join(" ");
    book.readingTime = calculateReadingTime(totalContent);
    await book.save();
  }

  return chapter;
}

/**
 * Deletes a specific chapter and reorders remaining chapters.
 * @param {string} bookId - The ID of the book.
 * @param {number} chapterNumber - The chapter number to delete.
 * @param {string} authorId - The ID of the author making the request.
 */
export async function deleteChapter(bookId, chapterNumber, authorId) {
  const book = await BookModel.findById(bookId);

  if (!book) {
    throw new AppError("BOOK_NOT_FOUND");
  }

  // Check if the user is the author of the book
  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete the chapter
    const deletedChapter = await ChapterModel.findOneAndDelete(
      { book: bookId, chapterNumber: chapterNumber },
      { session }
    );

    if (!deletedChapter) {
      throw new AppError("CHAPTER_NOT_FOUND", "Chapter not found.");
    }

    // Reorder chapters after the deleted one
    await ChapterModel.updateMany(
      { book: bookId, chapterNumber: { $gt: chapterNumber } },
      { $inc: { chapterNumber: -1 } },
      { session }
    );

    // Update reading time for the book
    const allChapters = await ChapterModel.find({ book: bookId }).session(session);
    if (allChapters.length > 0) {
      const totalContent = allChapters.map((c) => c.content).join(" ");
      book.readingTime = calculateReadingTime(totalContent);
    } else {
      book.readingTime = "0 min";
    }
    await book.save({ session });

    await session.commitTransaction();
    return { message: "Chapter deleted successfully." };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Reorders chapters based on a new order array.
 * @param {string} bookId - The ID of the book.
 * @param {Array<number>} chapterOrder - Array of chapter numbers in new order (e.g., [3, 1, 2]).
 * @param {string} authorId - The ID of the author making the request.
 */
export async function reorderChapters(bookId, chapterOrder, authorId) {
  const book = await BookModel.findById(bookId);

  if (!book) {
    throw new AppError("BOOK_NOT_FOUND");
  }

  // Check if the user is the author of the book
  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  // Validate chapter order array
  if (!Array.isArray(chapterOrder) || chapterOrder.length === 0) {
    throw new AppError("INVALID_CHAPTER_ORDER", "Chapter order must be a non-empty array.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get all chapters for this book
    const chapters = await ChapterModel.find({ book: bookId }).session(session);

    if (chapters.length !== chapterOrder.length) {
      throw new AppError(
        "INVALID_CHAPTER_ORDER",
        "Chapter order array length must match the number of chapters."
      );
    }

    // Validate that all chapter numbers are present
    const existingNumbers = chapters.map((c) => c.chapterNumber).sort((a, b) => a - b);
    const sortedOrder = [...chapterOrder].sort((a, b) => a - b);

    if (JSON.stringify(existingNumbers) !== JSON.stringify(sortedOrder)) {
      throw new AppError(
        "INVALID_CHAPTER_ORDER",
        "Chapter order array must contain all existing chapter numbers."
      );
    }

    // Step 1: Set all chapters to temporary negative numbers to avoid conflicts
    // This prevents duplicate chapter number errors during reordering
    for (let i = 0; i < chapters.length; i++) {
      await ChapterModel.updateOne(
        { book: bookId, chapterNumber: chapters[i].chapterNumber },
        { chapterNumber: -(i + 1) },
        { session }
      );
    }

    // Step 2: Update chapter numbers based on new order
    for (let newIndex = 0; newIndex < chapterOrder.length; newIndex++) {
      const oldChapterNumber = chapterOrder[newIndex];
      const newChapterNumber = newIndex + 1;

      // Find the chapter that was originally oldChapterNumber (now negative)
      const tempNumber = -(existingNumbers.indexOf(oldChapterNumber) + 1);
      
      await ChapterModel.updateOne(
        { book: bookId, chapterNumber: tempNumber },
        { chapterNumber: newChapterNumber },
        { session }
      );
    }

    await session.commitTransaction();
    return { message: "Chapters reordered successfully." };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

