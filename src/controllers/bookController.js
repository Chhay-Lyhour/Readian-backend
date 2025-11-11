import * as bookService from "../services/bookService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

export async function getAllBooks(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await bookService.getAllBooks({ page, limit });
    sendSuccessResponse(res, result, "Books retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getBookById(req, res, next) {
  try {
    // Pass req.user if it exists (from softAuth middleware), otherwise undefined
    const tokenUser = req.user || undefined;
    const book = await bookService.getBookById(req.params.id, tokenUser);
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

export async function searchBooks(req, res, next) {
  try {
    const { page, limit, ...searchCriteria } = req.query;
    const userPlan = req.user ? req.user.plan : "free";
    const result = await bookService.searchAndFilterBooks(
      searchCriteria,
      userPlan,
      { page, limit }
    );
    sendSuccessResponse(res, result, "Books retrieved successfully.");
  } catch (error) {
    next(error);
  }
}
