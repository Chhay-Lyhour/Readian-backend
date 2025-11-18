import { Router } from "express";
import * as controller from "../controllers/subscriptionController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validateRequestBody } from "../middlewares/requestValidatorMiddleware.js";
import { planSchema } from "../dto/subscriptionValidationSchema.js";

const router = Router();

// All subscription routes require the user to be logged in
router.use(requireAuth);

router.post("/activate", validateRequestBody(planSchema), controller.subscribe);
router.get("/status", controller.getStatus);

export default router;
