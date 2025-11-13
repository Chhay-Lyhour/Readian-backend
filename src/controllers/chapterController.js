import { chapterService } from "../services/chapterService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const createChapter = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  const chapterData = req.body;

  const chapter = await chapterService.createChapter(bookId, userId, chapterData);
  sendSuccessResponse(res, chapter, "Chapter created successfully.", 201);
});

const getChaptersByBook = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const chapters = await chapterService.getChaptersByBook(bookId);
  sendSuccessResponse(res, chapters, "Chapters retrieved successfully.");
});

const getChapterById = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const chapter = await chapterService.getChapterById(chapterId);
  sendSuccessResponse(res, chapter, "Chapter retrieved successfully.");
});

const updateChapter = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  const chapter = await chapterService.updateChapter(chapterId, userId, updateData);
  sendSuccessResponse(res, chapter, "Chapter updated successfully.");
});

const deleteChapter = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const userId = req.user.id;

  await chapterService.deleteChapter(chapterId, userId);
  sendSuccessResponse(res, null, "Chapter deleted successfully.");
});

export const chapterController = {
  createChapter,
  getChaptersByBook,
  getChapterById,
  updateChapter,
  deleteChapter,
};
