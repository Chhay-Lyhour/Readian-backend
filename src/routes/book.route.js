import express from "express";
import { getBooks, getBook } from "../controller/book.controller.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBook);

export default router;
