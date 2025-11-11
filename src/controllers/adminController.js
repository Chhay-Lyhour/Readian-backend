import * as adminService from "../services/adminService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

/**
 * Controller to get dashboard analytics.
 */
export async function getAnalytics(req, res, next) {
  try {
    const analytics = await adminService.getDashboardAnalytics();
    sendSuccessResponse(res, analytics, "Analytics retrieved successfully.");
  } catch (error) {
    next(error);
  }
}
