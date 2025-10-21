import express from "express";
import {
  getBooks,
  getBook,
  updateBook,
  createBook,
  deleteBook,
} from "../controllers/bookController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CRUD for book
router.get("/", getBooks);
router.get("/:id", getBook);

router.use(requireAuth); // All routes below this will be protected

router.post("/", requireRole(["AUTHOR"]), createBook);
router.put("/:id", requireRole(["AUTHOR"]), updateBook);
router.delete("/:id", requireRole(["AUTHOR"]), deleteBook);

export default router;
