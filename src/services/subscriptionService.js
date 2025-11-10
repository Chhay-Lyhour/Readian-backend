import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * UPDATED: Activates a 30-day subscription for a user for a specific plan.
 * @param {string} userId - The ID of the user subscribing.
 * @param {string} plan - The plan they are subscribing to ('basic' or 'premium').
 */
const activateSubscription = async (userId, plan) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("USER_NOT_FOUND");
  }

  const now = new Date();
  const expiresAt = new Date(new Date().setDate(now.getDate() + 30)); // 30 days from now

  // --- UPDATE THE USER DOCUMENT ---
  user.plan = plan; // <-- 1. Set the chosen plan
  user.subscriptionStatus = "active"; // 2. Set status to active
  user.subscriptionExpiresAt = expiresAt; // 3. Set expiration

  await user.save();

  // Return the new subscription details
  return {
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
  };
};

/**
 * UPDATED: Retrieves the current subscription status for a user, including their plan.
 * @param {string} userId - The ID of the user.
 */
const getSubscriptionStatus = async (userId) => {
  // We now also select the 'plan' field to return it to the user
  const user = await User.findById(userId).select(
    "plan subscriptionStatus subscriptionExpiresAt"
  );
  if (!user) {
    throw new AppError("USER_NOT_FOUND");
  }
  return user;
};

export { activateSubscription, getSubscriptionStatus };
