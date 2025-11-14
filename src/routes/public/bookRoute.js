import { Router } from "express";
import * as controller from "../../controllers/bookController.js";
import {
  softAuth,
} from "../../middlewares/authMiddleware.js";
import {
  validateRequestQuery,
} from "../../middlewares/requestValidatorMiddleware.js";
import {
  searchBookSchema,
  paginationQuerySchema,
} from "../../dto/bookValidationSchemas.js";

const router = Router();

// --- Public Route ---
// Anyone can get a list of all books.
router.get(
  "/",
  validateRequestQuery(paginationQuerySchema),
  controller.getAllBooks
);

// --- Search Route ---
router.get(
  "/search",
  softAuth,
  validateRequestQuery(searchBookSchema),
  controller.searchBooks
);

export default router;
