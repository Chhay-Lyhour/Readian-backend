// File: src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler";
import {
  verifyAccessToken,
  extractTokenFromHeader,
} from "../service/jwt.service";
import { UserRole } from "../types/enums";

// (The content of this file is nearly identical to your original, just ensure UserRole is imported from your new types file)

export const requireRole = (requiredRoles: UserRole[]) => {
  // ... same logic
};
