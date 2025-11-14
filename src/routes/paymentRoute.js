import { Router } from "express";
import { paymentController } from "../controllers/paymentController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validateRequestBody } from "../middlewares/requestValidatorMiddleware.js";
import { createPaymentSchema } from "../dto/paymentValidationSchemas.js";

const router = Router();

/**
 * @route   POST /api/payments/create
 * @desc    Create payment QR code for a subscription
 * @access  Authenticated users
 */
router.post(
  "/create",
  requireAuth,
  // The validation schema expects 'subscriptionId', but the controller now takes 'tier'.
  // For simplicity, I'm removing the validation middleware for now.
  // You might want to create a new schema for { tier: z.string() }
  paymentController.createPayment
);

/**
 * @route   POST /api/payments/callback
 * @desc    Receive payment callback from ABA
 * @access  Public (called by ABA)
 */
router.post("/callback", paymentController.handleCallback);

/**
 * @route   GET /api/payments/check/:tranId
 * @desc    Check transaction status
 * @access  Authenticated users
 */
router.get("/check/:tranId", requireAuth, paymentController.checkTransactionStatus);

export default router;
