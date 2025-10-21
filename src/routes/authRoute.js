import { Router } from "express";
import {
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
} from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import { validateRequestBody } from "../middlewares/requestValidatorMiddleware.js";
import {
  registerRequestSchema,
  loginRequestSchema,
  verifyEmailRequestSchema,
  refreshTokenRequestSchema,
  changePasswordRequestSchema,
  forgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  resendVerificationEmailSchema,
  verifyResetCodeRequestSchema,
} from "../dto/authValidationSchemas.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

const router = Router();

// Public Routes
router.post("/register", validateRequestBody(registerRequestSchema), register);
router.post(
  "/verify-email",
  validateRequestBody(verifyEmailRequestSchema),
  verifyEmailAddress
);
router.post(
  "/resend-verification",
  validateRequestBody(resendVerificationEmailSchema),
  resendVerificationCodeController
);
router.post("/login", validateRequestBody(loginRequestSchema), login);
router.post(
  "/forgot-password",
  validateRequestBody(forgotPasswordRequestSchema),
  forgotPasswordController
);
router.post(
  "/verify-password-reset-code",
  validateRequestBody(verifyResetCodeRequestSchema),
  verifyPasswordResetCodeController
);
router.post(
  "/reset-password",
  validateRequestBody(resetPasswordRequestSchema),
  resetPasswordController
);

// --- Protected Routes ---
router.use(requireAuth); // All routes below this will be protected

router.get("/me", getCurrentUser);
router.post(
  "/refresh-token",
  validateRequestBody(refreshTokenRequestSchema),
  refreshToken
);
router.post("/logout", validateRequestBody(refreshTokenRequestSchema), logout);
router.post("/logout-all-devices", logoutAllDevices);
router.post(
  "/change-password",
  validateRequestBody(changePasswordRequestSchema),
  changePasswordController
);

router.get("/admin-only", requireRole(["ADMIN"]), (req, res) => {
  sendSuccessResponse(
    res,
    { message: `Welcome Admin, ${req.user?.email}` },
    "Admin access granted"
  );
});

export default router;
