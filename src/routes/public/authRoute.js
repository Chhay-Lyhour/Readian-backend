import { Router } from "express";
import {
  register,
  verifyEmailAddress,
  login,
  resendVerificationCodeController,
  refreshToken,
  logout,
  logoutAllDevices,
  forgotPasswordController,
  verifyPasswordResetCodeController,
  resetPasswordController,
  changePasswordController,
} from "../../controllers/authController.js";
import { requireAuth, requireRole } from "../../middlewares/authMiddleware.js";
import { validateRequestBody } from "../../middlewares/requestValidatorMiddleware.js";
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
} from "../../dto/authValidationSchemas.js";
import { sendSuccessResponse } from "../../utils/responseHandler.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID.
 *         name:
 *           type: string
 *           description: The user's name.
 *         email:
 *           type: string
 *           description: The user's email.
 *         role:
 *           type: string
 *           enum: [USER, AUTHOR, ADMIN]
 *           description: The user's role.
 *     Tokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request (e.g., validation error).
 *       409:
 *         description: Email already exists.
 */
router.post("/register", validateRequestBody(registerRequestSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Invalid credentials or email not verified.
 */
router.post("/login", validateRequestBody(loginRequestSchema), login);

// ... (add swagger docs for other routes)

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
