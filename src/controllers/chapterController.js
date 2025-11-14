import * as chapterService from "../services/chapterService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

export async function createChapter(req, res, next) {
  try {
    const { bookId } = req.params;
    const chapter = await chapterService.createChapter(
      bookId,
      req.body,
      req.user.id
    );
    sendSuccessResponse(res, chapter, "Chapter created successfully.", 201);
  } catch (error) {
    next(error);
  }
}

export async function getChapter(req, res, next) {
  try {
    const { chapterId } = req.params;
    const chapter = await chapterService.getChapterById(chapterId);
    sendSuccessResponse(res, chapter, "Chapter retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function updateChapter(req, res, next) {
  try {
    const { chapterId } = req.params;
    const chapter = await chapterService.updateChapter(
      chapterId,
      req.body,
      req.user.id
    );
    sendSuccessResponse(res, chapter, "Chapter updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function deleteChapter(req, res, next) {
  try {
    const { chapterId } = req.params;
    const result = await chapterService.deleteChapter(chapterId, req.user.id);
    sendSuccessResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
}
