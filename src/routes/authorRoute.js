import { Router } from "express";
import * as controller from "../controllers/userController.js";
import { validateRequestQuery } from "../middlewares/requestValidatorMiddleware.js";
import { paginationQuerySchema } from "../dto/bookValidationSchemas.js";
const router = Router();
/**
 * @route GET /api/authors/:authorId
 * @desc Get public author profile with their books
 * @access Public
 */
router.get(
  "/:authorId",
  validateRequestQuery(paginationQuerySchema),
  controller.getAuthorProfile
);
export default router;
