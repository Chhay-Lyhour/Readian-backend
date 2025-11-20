import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";
import { checkAndHandleExpiredSubscription } from "../services/subscriptionService.js";

/**
 * Middleware to verify if user has an active premium subscription
 * Automatically handles expired subscriptions
 */
export const verifyPremiumSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "plan subscriptionStatus subscriptionExpiresAt"
    );

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found");
    }

    // Check and handle expired subscriptions
    const wasExpired = await checkAndHandleExpiredSubscription(user);

    if (wasExpired) {
      throw new AppError(
        "SUBSCRIPTION_EXPIRED",
        "Your subscription has expired. Please renew to access premium features.",
        403
      );
    }

    // Check if user has premium plan
    if (user.plan !== "premium") {
      throw new AppError(
        "PREMIUM_REQUIRED",
        "This feature is only available for premium subscribers. Please upgrade your plan.",
        403
      );
    }

    // Check if subscription is active
    if (user.subscriptionStatus !== "active") {
      throw new AppError(
        "SUBSCRIPTION_INACTIVE",
        "Your subscription is not active. Please activate or renew your subscription.",
        403
      );
    }

    // All checks passed, proceed to next middleware
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify if user has any active subscription (basic or premium)
 */
export const verifyActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "plan subscriptionStatus subscriptionExpiresAt"
    );

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found");
    }

    // Check and handle expired subscriptions
    await checkAndHandleExpiredSubscription(user);

    // Check if user has any paid plan
    if (user.plan === "free") {
      throw new AppError(
        "SUBSCRIPTION_REQUIRED",
        "This feature requires an active subscription. Please subscribe to a plan.",
        403
      );
    }

    // Check if subscription is active
    if (user.subscriptionStatus !== "active") {
      throw new AppError(
        "SUBSCRIPTION_INACTIVE",
        "Your subscription is not active. Please activate or renew your subscription.",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

