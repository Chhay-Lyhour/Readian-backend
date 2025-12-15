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

export async function getUserGrowthAnalytics(req, res, next) {
  try {
    const { period = 'week' } = req.query;

    // Validate period
    if (!['week', 'month', 'year'].includes(period)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid period. Must be one of: week, month, year'
      });
    }

    const analytics = await analyticsService.getUserGrowthAnalytics(period);
    sendSuccessResponse(res, analytics, "User growth analytics retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getRevenueGrowthAnalytics(req, res, next) {
  try {
    const { period = 'week' } = req.query;

    // Validate period
    if (!['week', 'month', 'year'].includes(period)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid period. Must be one of: week, month, year'
      });
    }

    const analytics = await analyticsService.getRevenueGrowthAnalytics(period);
    sendSuccessResponse(res, analytics, "Revenue growth analytics retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getAdminDashboardAnalytics(req, res, next) {
  try {
    const analytics = await analyticsService.getAdminDashboardAnalytics();
    sendSuccessResponse(res, analytics, "Admin dashboard analytics retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

