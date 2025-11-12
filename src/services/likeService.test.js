import mongoose from "mongoose";
import { likeBook, unlikeBook } from "./likeService.js";
import BookModel from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";
import { connectDB, disconnectDB, clearDB } from "../config/db.js";

let user;
let book;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();
  user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
  book = await BookModel.create({
    title: "Test Book",
    author: user._id,
    chapter: 1,
  });
});

describe("Like Service", () => {
  describe("likeBook", () => {
    it("should allow a user to like a book", async () => {
      await likeBook(user._id, book._id);

      const updatedBook = await BookModel.findById(book._id);
      expect(updatedBook.likes).toBe(1);
      expect(updatedBook.likedBy).toContainEqual(user._id);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.likedBooks).toContainEqual(book._id);
    });

    it("should throw an error if the book is already liked", async () => {
      await likeBook(user._id, book._id);
      await expect(likeBook(user._id, book._id)).rejects.toThrow(
        new AppError("ALREADY_LIKED", "You have already liked this book.")
      );
    });
  });

  describe("unlikeBook", () => {
    it("should allow a user to unlike a book", async () => {
      await likeBook(user._id, book._id);
      await unlikeBook(user._id, book._id);

      const updatedBook = await BookModel.findById(book._id);
      expect(updatedBook.likes).toBe(0);
      expect(updatedBook.likedBy).not.toContainEqual(user._id);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.likedBooks).not.toContainEqual(book._id);
    });

    it("should throw an error if the book is not liked", async () => {
      await expect(unlikeBook(user._id, book._id)).rejects.toThrow(
        new AppError("NOT_LIKED", "You have not liked this book.")
      );
    });
  });
});
