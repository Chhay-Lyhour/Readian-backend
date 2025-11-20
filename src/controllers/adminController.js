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

/**
 * Controller for admin to delete any book (including all its chapters).
 */
export async function deleteBookByAdmin(req, res, next) {
  try {
    const result = await adminService.deleteBookByAdmin(req.params.id);
    sendSuccessResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

