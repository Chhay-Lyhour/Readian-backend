import { User } from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Creates a new subscription record with a 'pending' status.
 * @param {string} userId - The ID of the user subscribing.
 * @param {string} tier - The subscription tier ('monthly' or 'yearly').
 */
const createSubscription = async (userId, tier) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("USER_NOT_FOUND");
  }

  const amounts = {
    monthly: 5.00,
    yearly: 50.00,
  };

  if (!amounts[tier]) {
    throw new AppError("Invalid subscription tier.", 400);
  }

  // Create a new subscription document
  const subscription = await Subscription.create({
    user: userId,
    tier,
    amount: amounts[tier],
    status: "pending",
  });

  return subscription;
};

/**
 * Retrieves the current subscription status for a user.
 * @param {string} userId - The ID of the user.
 */
const getSubscriptionStatus = async (userId) => {
  const subscription = await Subscription.findOne({ user: userId }).sort({ createdAt: -1 });
  if (!subscription) {
    return { status: "inactive" };
  }
  return subscription;
};

export { createSubscription, getSubscriptionStatus };
