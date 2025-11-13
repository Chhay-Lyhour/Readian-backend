import { paymentService } from "../services/paymentService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

/**
 * Create payment QR code for a subscription
 */
async function createPayment(req, res, next) {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.id;

    const result = await paymentService.createPayment(subscriptionId, userId);

    sendSuccessResponse(res, result, "Payment QR code created successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Handle payment callback from ABA
 */
async function handleCallback(req, res, next) {
  try {
    const callbackData = req.body;
    const result = await paymentService.handleCallback(callbackData);

    // ABA expects a simple response to acknowledge receipt
    res.status(200).json({
      success: true,
      message: "Payment callback processed",
      status: result.status,
    });
  } catch (error) {
    // Even if there's an error, acknowledge receipt to ABA
    // to prevent repeated callbacks. Log the error for debugging.
    console.error("Callback handling error:", error);
    res.status(200).json({
      success: false,
      message: "Callback processed with internal error.",
    });
  }
}

/**
 * Check transaction status
 */
async function checkTransactionStatus(req, res, next) {
  try {
    const { tranId } = req.params;
    const result = await paymentService.checkTransactionStatus(tranId);

    sendSuccessResponse(res, result, "Transaction status retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export const paymentController = {
  createPayment,
  handleCallback,
  checkTransactionStatus,
};
