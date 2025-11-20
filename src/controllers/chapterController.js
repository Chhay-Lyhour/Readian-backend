import * as chapterService from "../services/chapterService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

/**
 * Add a new chapter to a book
 */
export async function addChapter(req, res, next) {
  try {
    const chapter = await chapterService.addChapterToBook(
      req.params.bookId,
      req.body,
      req.user.id
    );
    sendSuccessResponse(res, chapter, "Chapter added successfully.");
  } catch (error) {
    next(error);
  }
}

/**
 * Update a specific chapter
 */
export async function updateChapter(req, res, next) {
  try {
    const chapter = await chapterService.updateChapter(
      req.params.bookId,
      parseInt(req.params.chapterNumber),
      req.body,
      req.user.id
    );
    sendSuccessResponse(res, chapter, "Chapter updated successfully.");
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a specific chapter
 */
export async function deleteChapter(req, res, next) {
  try {
    const result = await chapterService.deleteChapter(
      req.params.bookId,
      parseInt(req.params.chapterNumber),
      req.user.id
    );
    sendSuccessResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * Reorder chapters
 */
export async function reorderChapters(req, res, next) {
  try {
    const result = await chapterService.reorderChapters(
      req.params.bookId,
      req.body.chapterOrder,
      req.user.id
    );
    sendSuccessResponse(res, result, "Chapters reordered successfully.");
  } catch (error) {
    next(error);
  }
}

