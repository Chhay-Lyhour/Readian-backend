import { AppError } from "../utils/errorHandler.js";
import {
  verifyAccessToken,
  extractTokenFromHeader,
} from "../services/jwtService.js";
import { UserRole } from "../models/userModel.js";

const requireAuth = (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) throw new AppError("TOKEN_INVALID");

    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
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

export { requireAuth, requireRole };
