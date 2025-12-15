import { Router } from "express";
import * as controller from "../controllers/analyticsController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

// Public analytics (no auth required)
router.get("/public", controller.getPublicAnalytics);

// Admin-only analytics routes (protected with authentication)
router.get(
  "/admin/dashboard",
  requireAuth,
  controller.getAdminDashboardAnalytics
);

router.get(
  "/admin/user-growth",
  requireAuth,
  controller.getUserGrowthAnalytics
);

router.get(
  "/admin/revenue-growth",
  requireAuth,
  controller.getRevenueGrowthAnalytics
);

export default router;
