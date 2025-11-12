import * as analyticsService from "../services/analyticsService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

export async function getPublicAnalytics(req, res, next) {
  try {
    const analytics = await analyticsService.getPublicAnalytics();
    sendSuccessResponse(res, analytics, "Public analytics retrieved successfully.");
  } catch (error) {
    next(error);
  }
}
