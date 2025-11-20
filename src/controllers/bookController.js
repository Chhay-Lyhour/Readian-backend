import * as bookService from "../services/bookService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

export async function getAllBooks(req, res, next) {
  try {
    const { page, limit } = req.query;
    const user = req.user || undefined;
    const result = await bookService.getAllBooks({ page, limit, user });
    sendSuccessResponse(res, result, "Books retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getBookById(req, res, next) {
  try {
    const tokenUser = req.user || undefined;
    const { chapterPage, chapterLimit } = req.query;
    const book = await bookService.getBookById(req.params.id, tokenUser, {
      chapterPage,
      chapterLimit,
    });
    sendSuccessResponse(res, book, "Book retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function createBook(req, res, next) {
  try {
    const book = await bookService.createBook(req.body, req.user.id, req.file);
    sendSuccessResponse(res, book, "Book created successfully.");
  } catch (error) {
    next(error);
  }
}

export async function updateBook(req, res, next) {
  try {
    const book = await bookService.updateBookById(
      req.params.id,
      req.body,
      req.user.id,
      req.file
    );
    sendSuccessResponse(res, book, "Book updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function deleteBook(req, res, next) {
  try {
    const result = await bookService.deleteBookById(req.params.id, req.user.id);
    sendSuccessResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

export async function publishBook(req, res, next) {
  try {
    const book = await bookService.publishBook(req.params.id, req.user.id);
    sendSuccessResponse(res, book, "Book published successfully.");
  } catch (error) {
    next(error);
  }
}

export async function togglePremium(req, res, next) {
  try {
    const book = await bookService.togglePremiumStatus(req.params.id, req.user.id);
    const message = book.isPremium 
      ? "Book marked as premium." 
      : "Book marked as free.";
    sendSuccessResponse(res, book, message);
  } catch (error) {
    next(error);
  }
}

export async function updateBookStatus(req, res, next) {
  try {
    const book = await bookService.updateBookStatus(
      req.params.id, 
      req.body.bookStatus, 
      req.user.id
    );
    sendSuccessResponse(res, book, "Book status updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function searchBooks(req, res, next) {
  try {
    const { page, limit, ...searchCriteria } = req.query;
    const user = req.user || undefined;
    const userPlan = user ? user.plan : "free";
    const result = await bookService.searchAndFilterBooks(
      searchCriteria,
      userPlan,
      { page, limit },
      user
    );
    sendSuccessResponse(res, result, "Books retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getBookChapters(req, res, next) {
  try {
    const tokenUser = req.user || undefined;
    const { chapterPage, chapterLimit } = req.query;
    const result = await bookService.getBookChapters(
      req.params.id,
      tokenUser,
      { chapterPage, chapterLimit }
    );
    sendSuccessResponse(res, result, "Chapters retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getChapterByNumber(req, res, next) {
  try {
    const tokenUser = req.user || undefined;
    const chapter = await bookService.getChapterByNumber(
      req.params.id,
      parseInt(req.params.chapterNumber),
      tokenUser
    );
    sendSuccessResponse(res, chapter, "Chapter retrieved successfully.");
  } catch (error) {
    next(error);
  }
}
