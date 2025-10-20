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
router.post("/login", validateRequestBody(loginRequestSchema), login);

// --- Protected Routes ---
router.use(requireAuth); // All routes below this will be protected

router.get("/me", getCurrentUser);
router.post("/resend-verification", resendVerificationCodeController);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/logout-all-devices", logoutAllDevices);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-password-reset-code", verifyPasswordResetCodeController);
router.post("/reset-password", resetPasswordController);
router.post("/change-password", changePasswordController);

router.get("/admin-only", requireRole(["ADMIN"]), (req, res) => {
  sendSuccessResponse(
    res,
    { message: `Welcome Admin, ${req.user?.email}` },
    "Admin access granted"
  );
});

const authRouter = router;

export default authRouter;
