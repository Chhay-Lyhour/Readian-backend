import { Router } from "express";
import * as controller from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes in this file are for admins only and require authentication
router.use(requireAuth, requireRole(["ADMIN"]));

// GET /api/admin/analytics
router.get("/analytics", controller.getAnalytics);

export default router;
