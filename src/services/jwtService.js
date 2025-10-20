import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../utils/errorHandler.js";
import { config } from "../config/config.js";

const JWT_ACCESS_SECRET = config.jwtAccessSecret;
const JWT_REFRESH_SECRET = config.jwtRefreshSecret;
const JWT_ACCESS_EXPIRY = parseInt(config.jwtAccessExpiry);
const JWT_REFRESH_EXPIRY = parseInt(config.jwtRefreshExpiry);

const generateTokenPair = (userId, email, role) => {
  const payload = { userId, email, role };
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });
  return { accessToken, refreshToken, expiresIn: JWT_ACCESS_EXPIRY };
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      throw new AppError("TOKEN_EXPIRED");
    throw new AppError("TOKEN_INVALID");
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("TOKEN_INVALID");
  }
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const extractTokenFromHeader = (authHeader) =>
  authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

export {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  extractTokenFromHeader,
};
