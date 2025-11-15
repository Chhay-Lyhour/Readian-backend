import { Router } from "express";
import * as controller from "../controllers/analyticsController.js";

const router = Router();

router.get("/public", controller.getPublicAnalytics);

export default router;
