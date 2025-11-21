 import * as subscriptionService from "../services/subscriptionService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const subscribe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { plan, duration = 30 } = req.body; // <-- 1. Get the plan and duration from the validated body

  // 2. Pass the chosen plan and duration to the service
  const subscription = await subscriptionService.activateSubscription(
    userId,
    plan,
    duration
  );

  // 3. Send a more specific success message
  sendSuccessResponse(
    res,
    subscription,
    `Subscription activated successfully for the ${plan} plan (${duration} days).`
  );
});

// This controller function remains unchanged
const getStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const status = await subscriptionService.getSubscriptionStatus(userId);
  sendSuccessResponse(res, status, "Subscription status retrieved.");
});

export { subscribe, getStatus };
