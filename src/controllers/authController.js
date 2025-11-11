import { sendSuccessResponse } from "../utils/responseHandler.js";
import {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutFromAllDevices,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
  changePassword,
} from "../services/authService.js";
import { findUserById } from "../repositories/authRepositories.js";
import { AppError } from "../utils/errorHandler.js";

// A simple wrapper for async controller functions to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  sendSuccessResponse(res, { userId: result.userId }, result.message, 201);
});

const verifyEmailAddress = asyncHandler(async (req, res) => {
  const result = await verifyEmail(req.body);
  sendSuccessResponse(res, { user: result.user }, result.message);
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  sendSuccessResponse(res, result, "Login successful.");
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("TOKEN_INVALID");
  // For simplicity, we return the user object from the token.
  // For fresh data, you would call a repository function here.
  const user = await findUserById(req.user.id);
  sendSuccessResponse(res, { user: user }, "User profile retrieved.");
});

const resendVerificationCodeController = asyncHandler(async (req, res) => {
  const result = await resendVerificationCode(req.body);
  sendSuccessResponse(res, result, result.message);
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await refreshAccessToken(req.body);
  sendSuccessResponse(res, result, "Token refreshed successfully.");
});

const logout = asyncHandler(async (req, res) => {
  const result = await logoutUser(req.body);
  sendSuccessResponse(res, result, result.message);
});

const logoutAllDevices = asyncHandler(async (req, res) => {
  const result = await logoutFromAllDevices(req.user.id);
  sendSuccessResponse(res, result, result.message);
});

const forgotPasswordController = asyncHandler(async (req, res) => {
  const result = await forgotPassword(req.body);
  sendSuccessResponse(res, result, result.message);
});

const verifyPasswordResetCodeController = asyncHandler(async (req, res) => {
  const result = await verifyPasswordResetCode(req.body);
  sendSuccessResponse(res, result, result.message);
});

const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await resetPassword(req.body);
  sendSuccessResponse(res, result, result.message);
});

const changePasswordController = asyncHandler(async (req, res) => {
  const result = await changePassword(req.user.id, req.body);
  sendSuccessResponse(res, result, result.message);
});

export {
  register,
  verifyEmailAddress,
  login,
  getCurrentUser,
  resendVerificationCodeController,
  refreshToken,
  logout,
  logoutAllDevices,
  forgotPasswordController,
  verifyPasswordResetCodeController,
  resetPasswordController,
  changePasswordController,
};
