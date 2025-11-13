import * as subscriptionService from "../services/subscriptionService.js";
import { paymentService } from "../services/paymentService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const createSubscriptionPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { tier } = req.body; // 'monthly' or 'yearly'

  // 1. Create a pending subscription
  const subscription = await subscriptionService.createSubscription(userId, tier);

  // 2. Create a payment for that subscription
  const paymentDetails = await paymentService.createPayment(subscription._id, userId);

  sendSuccessResponse(
    res,
    paymentDetails,
    `Payment QR code created for ${tier} subscription.`
  );
});

const getStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const status = await subscriptionService.getSubscriptionStatus(userId);
  sendSuccessResponse(res, status, "Subscription status retrieved.");
});

export { createSubscriptionPayment, getStatus };
