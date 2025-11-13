import Chapter from "../models/chapterModel.js";
import Book from "../models/bookModel.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Create a new chapter for a book.
 */
async function createChapter(bookId, userId, chapterData) {
  const book = await Book.findById(bookId);
  if (!book) {
    throw new AppError("Book not found.", 404);
  }

  // Ensure the user is the author of the book
  if (book.author.toString() !== userId) {
    throw new AppError("You are not authorized to add a chapter to this book.", 403);
  }

  const chapter = await Chapter.create({
    ...chapterData,
    book: bookId,
    author: userId,
  });

  // Add chapter to the book's list of chapters
  book.chapters.push(chapter._id);
  await book.save();

  return chapter;
}

/**
 * Get all chapters for a book.
 */
async function getChaptersByBook(bookId) {
  const chapters = await Chapter.find({ book: bookId }).sort({ createdAt: 1 });
  return chapters;
}

/**
 * Get a single chapter by its ID.
 */
async function getChapterById(chapterId) {
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    throw new AppError("Chapter not found.", 404);
  }
  return chapter;
}

/**
 * Update a chapter.
 */
async function updateChapter(chapterId, userId, updateData) {
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    throw new AppError("Chapter not found.", 404);
  }

  const book = await Book.findById(chapter.book);
  if (!book) {
    throw new AppError("Associated book not found.", 404);
  }

  // Ensure the user is the author of the book (and thus the chapter)
  if (book.author.toString() !== userId) {
    throw new AppError("You are not authorized to update this chapter.", 403);
  }

  Object.assign(chapter, updateData);
  await chapter.save();
  return chapter;
}

/**
 * Delete a chapter.
 */
async function deleteChapter(chapterId, userId) {
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    throw new AppError("Chapter not found.", 404);
  }

  const book = await Book.findById(chapter.book);
  if (!book) {
    throw new AppError("Associated book not found.", 404);
  }

  // Ensure the user is the author of the book (and thus the chapter)
  if (book.author.toString() !== userId) {
    throw new AppError("You are not authorized to delete this chapter.", 403);
  }

  // Remove the chapter from the book's list of chapters
  await Book.findByIdAndUpdate(chapter.book, {
    $pull: { chapters: chapter._id },
  });

  await chapter.deleteOne();
}

export const chapterService = {
  createChapter,
  getChaptersByBook,
  getChapterById,
  updateChapter,
  deleteChapter,
};
