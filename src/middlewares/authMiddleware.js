import { AppError } from "../utils/errorHandler.js";
import {
  verifyAccessToken,
  extractTokenFromHeader,
} from "../services/jwtService.js";
import { UserRole } from "../models/userModel.js";
import * as userRepo from "../repositories/userRepositories.js";

const requireAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) throw new AppError("TOKEN_INVALID");

    const decoded = verifyAccessToken(token);
    const user = await userRepo.findUserById(decoded.userId);
    if (!user) {
      return next(new AppError("USER_NOT_FOUND", "User not found."));
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return next(new AppError("INSUFFICIENT_PERMISSIONS"));
    }
    next();
  };
};

/**
 * Soft authentication middleware - optionally authenticates the user if a token is present.
 * Does not throw an error if no token is provided, allowing the route to proceed anonymously.
 * If a valid token is present, req.user will be set.
 */
const softAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await userRepo.findUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    // Continue even if no token is present
    next();
  } catch (error) {
    // If token is invalid, just continue without setting req.user
    // This allows the route to proceed as an anonymous request
    next();
  }
};

export { requireAuth, requireRole, softAuth };
