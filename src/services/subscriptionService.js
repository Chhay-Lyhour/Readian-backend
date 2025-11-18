import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Activates or upgrades a subscription for a user.
 * - Changes plan from 'free' to 'basic' or 'premium'
 * - Upgrades from 'basic' to 'premium' (renews subscription for 30 days)
 * - If subscription is expired or inactive, starts a new 30-day subscription
 * - If same plan or downgrading, keeps the existing expiration date
 * @param {string} userId - The ID of the user subscribing.
 * @param {string} plan - The plan they are subscribing to ('basic' or 'premium').
 */
const activateSubscription = async (userId, plan) => {
  // Validate plan type
  if (!["basic", "premium"].includes(plan)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Plan must be either 'basic' or 'premium'."
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("USER_NOT_FOUND");
  }

  const now = new Date();
  let expiresAt;

  // Check if user has an active subscription
  const hasActiveSubscription =
    user.subscriptionStatus === "active" &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > now;

  // Check if this is an upgrade from basic to premium
  const isUpgradeToPremium =
    hasActiveSubscription && user.plan === "basic" && plan === "premium";

  if (isUpgradeToPremium) {
    // Upgrading from basic to premium: renew subscription (extend 30 days from now)
    expiresAt = new Date(new Date().setDate(now.getDate() + 30));
  } else if (hasActiveSubscription) {
    // Same plan or downgrading: keep existing expiration
    expiresAt = user.subscriptionExpiresAt;
  } else {
    // No active subscription, start a new 30-day subscription
    expiresAt = new Date(new Date().setDate(now.getDate() + 30));
  }

  // --- UPDATE THE USER DOCUMENT ---
  user.plan = plan; // Set the chosen plan
  user.subscriptionStatus = "active"; // Set status to active
  user.subscriptionExpiresAt = expiresAt; // Set or keep expiration

  await user.save();

  // Return the new subscription details
  return {
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
  };
};

/**
 * Checks if a user's subscription has expired and automatically downgrades them to free plan.
 * This should be called whenever checking subscription status.
 * @param {object} user - The user document.
 * @returns {boolean} - Returns true if subscription was expired and user was downgraded.
 */
const checkAndHandleExpiredSubscription = async (user) => {
  const now = new Date();
  const isExpired =
    user.subscriptionStatus === "active" &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) <= now;

  if (isExpired) {
    // Automatically downgrade to free plan
    user.plan = "free";
    user.subscriptionStatus = "inactive";
    await user.save();
    return true;
  }

  return false;
};

/**
 * Retrieves the current subscription status for a user, including their plan.
 * Automatically handles expired subscriptions by downgrading to free plan.
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

  // Check and handle expired subscriptions
  await checkAndHandleExpiredSubscription(user);

  // Return updated user data
  return {
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
  };
};

export {
  activateSubscription,
  getSubscriptionStatus,
  checkAndHandleExpiredSubscription,
};
