import request from "supertest";
import app from "../../app.js";
import { connectDB, disconnectDB, clearDB } from "../../config/db.js";
import BookModel from "../../models/bookModel.js";
import ChapterModel from "../../models/chapterModel.js";
import { User } from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import { config } from "../../config/config.js";
import mongoose from "mongoose";

let authorToken;
let authorId;
let bookId;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();

  const author = await User.create({
    name: "Test Author",
    email: "author@example.com",
    password: "password123",
    role: "AUTHOR",
  });
  authorId = author._id;
  authorToken = jwt.sign({ id: authorId, role: "AUTHOR" }, config.jwtAccessSecret, {
    expiresIn: "1h",
  });

  const book = await BookModel.create({
    title: "Test Book",
    author: authorId,
    description: "A book for testing chapters",
    status: "published",
    genre: "Fiction",
    coverImage: "http://example.com/cover.jpg",
  });
  bookId = book._id;
});

describe("Chapter Routes", () => {
  describe("POST /api/books/:bookId/chapters", () => {
    it("should create a new chapter for a book", async () => {
      const chapterData = {
        chapterNumber: 1,
        title: "Chapter 1: The Beginning",
        content: "This is the content of the first chapter.",
      };

      const res = await request(app)
        .post(`/api/books/${bookId}/chapters`)
        .set("Authorization", `Bearer ${authorToken}`)
        .send(chapterData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(chapterData.title);
      expect(res.body.data.chapterNumber).toBe(chapterData.chapterNumber);

      const book = await BookModel.findById(bookId);
      expect(book.chapters).toHaveLength(1);
      expect(book.chapters[0].toString()).toEqual(res.body.data._id);
    });

    it("should return 400 for invalid chapter data", async () => {
      const chapterData = {
        // Missing chapterNumber, title, and content
      };

      const res = await request(app)
        .post(`/api/books/${bookId}/chapters`)
        .set("Authorization", `Bearer ${authorToken}`)
        .send(chapterData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error.message).toContain("Invalid input");
    });
  });

  describe("GET /api/chapters/:chapterId", () => {
    let chapterId;

    beforeEach(async () => {
      const chapter = await ChapterModel.create({
        book: bookId,
        chapterNumber: 1,
        title: "Test Chapter",
        content: "Test content",
      });
      chapterId = chapter._id;
    });

    it("should get a chapter by its ID", async () => {
      const res = await request(app)
        .get(`/api/chapters/${chapterId}`)
        .set("Authorization", `Bearer ${authorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toEqual(chapterId.toString());
    });

    it("should return 404 if chapter not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/chapters/${nonExistentId}`)
        .set("Authorization", `Bearer ${authorToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error.message).toBe("Chapter not found.");
    });
  });

  describe("PATCH /api/chapters/:chapterId", () => {
    let chapterId;

    beforeEach(async () => {
      const chapter = await ChapterModel.create({
        book: bookId,
        chapterNumber: 1,
        title: "Original Title",
        content: "Original content",
      });
      chapterId = chapter._id;
    });

    it("should update a chapter", async () => {
      const updatedData = {
        title: "Updated Title",
        isPremium: true,
      };

      const res = await request(app)
        .patch(`/api/chapters/${chapterId}`)
        .set("Authorization", `Bearer ${authorToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updatedData.title);
      expect(res.body.data.isPremium).toBe(updatedData.isPremium);
    });
  });

  describe("DELETE /api/chapters/:chapterId", () => {
    let chapterId;

    beforeEach(async () => {
      const chapter = await ChapterModel.create({
        book: bookId,
        chapterNumber: 1,
        title: "To Be Deleted",
        content: "This chapter will be deleted.",
      });
      chapterId = chapter._id;

      await BookModel.findByIdAndUpdate(bookId, {
        $push: { chapters: chapterId },
      });
    });

    it("should delete a chapter", async () => {
      const res = await request(app)
        .delete(`/api/chapters/${chapterId}`)
        .set("Authorization", `Bearer ${authorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Chapter deleted successfully.");

      const deletedChapter = await ChapterModel.findById(chapterId);
      expect(deletedChapter).toBeNull();

      const book = await BookModel.findById(bookId);
      expect(book.chapters).not.toContain(chapterId);
    });
  });
});
