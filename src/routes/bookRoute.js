import express from "express";
import {
  getBooks,
  getBook,
  updateBook,
  createBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = express.Router();

// CRUD for book
router.get("/", getBooks);
router.get("/:id", getBook);
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;
