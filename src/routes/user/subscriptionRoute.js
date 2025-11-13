import { Router } from "express";
import { createSubscriptionPayment, getStatus } from "../../controllers/subscriptionController.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = Router();

// All subscription routes require the user to be logged in
router.use(requireAuth);

router.post("/create-payment", createSubscriptionPayment);
router.get("/status", getStatus);

export default router;
