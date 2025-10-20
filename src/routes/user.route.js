import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  createUser,
  deleteUser,
} from "../controller/user.controller.js";

const router = express.Router();

// CRUD for User
router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
