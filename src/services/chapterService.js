import ChapterModel from "../models/chapterModel.js";
import BookModel from "../models/bookModel.js";
import { AppError } from "../utils/errorHandler.js";

export async function createChapter(bookId, chapterData, authorId) {
  const book = await BookModel.findById(bookId);
  if (!book) {
    throw new AppError("BOOK_NOT_FOUND", "Book not found.");
  }

  if (book.author.toString() !== authorId) {
    throw new AppError(
      "FORBIDDEN",
      "You are not authorized to add chapters to this book."
    );
  }

  const chapter = await ChapterModel.create({
    book: bookId,
    ...chapterData,
  });

  book.chapters.push(chapter._id);
  await book.save();

  return chapter;
}

export async function getChapterById(chapterId) {
  const chapter = await ChapterModel.findById(chapterId);
  if (!chapter) {
    throw new AppError("CHAPTER_NOT_FOUND", "Chapter not found.");
  }
  return chapter;
}

export async function updateChapter(chapterId, chapterData, authorId) {
  const chapter = await ChapterModel.findById(chapterId).populate("book");
  if (!chapter) {
    throw new AppError("CHAPTER_NOT_FOUND", "Chapter not found.");
  }

  if (chapter.book.author.toString() !== authorId) {
    throw new AppError(
      "FORBIDDEN",
      "You are not authorized to update this chapter."
    );
  }

  Object.assign(chapter, chapterData);
  await chapter.save();
  return chapter;
}

export async function deleteChapter(chapterId, authorId) {
  const chapter = await ChapterModel.findById(chapterId).populate("book");
  if (!chapter) {
    throw new AppError("CHAPTER_NOT_FOUND", "Chapter not found.");
  }

  if (chapter.book.author.toString() !== authorId) {
    throw new AppError(
      "FORBIDDEN",
      "You are not authorized to delete this chapter."
    );
  }

  await ChapterModel.findByIdAndDelete(chapterId);

  // Remove chapter from book's chapter list
  await BookModel.findByIdAndUpdate(chapter.book._id, {
    $pull: { chapters: chapterId },
  });

  return { message: "Chapter deleted successfully." };
}
