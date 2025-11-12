import * as likeService from "../services/likeService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

export async function likeBook(req, res, next) {
  try {
    const result = await likeService.likeBook(req.user.id, req.params.id);
    sendSuccessResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function unlikeBook(req, res, next) {
  try {
    const result = await likeService.unlikeBook(req.user.id, req.params.id);
    sendSuccessResponse(res, result);
  } catch (error) {
    next(error);
  }
}
