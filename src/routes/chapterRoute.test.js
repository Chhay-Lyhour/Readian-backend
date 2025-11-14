import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, clearDB } from "../config/db.js";
import BookModel from "../models/bookModel.js";
import ChapterModel from "../models/chapterModel.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

let token;
let userId;
let bookId;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();
  const user = await User.create({
    name: "Test Author",
    email: "author@example.com",
    password: "password123",
    role: "AUTHOR",
  });
  userId = user._id;

  const book = await BookModel.create({
    title: "Test Book for Chapters",
    author: userId,
  });
  bookId = book._id;

  token = jwt.sign({ id: userId, role: "AUTHOR" }, config.jwtAccessSecret, {
    expiresIn: "1h",
  });
});

describe("Chapter Routes", () => {
  describe("POST /api/books/:bookId/chapters", () => {
    it("should create a new chapter for a book", async () => {
      const chapterData = {
        title: "Chapter 1",
        content: "This is the content of the first chapter.",
        chapterNumber: 1,
      };

      const res = await request(app)
        .post(`/api/books/${bookId}/chapters`)
        .set("Authorization", `Bearer ${token}`)
        .send(chapterData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.title).toBe(chapterData.title);
      expect(res.body.data.chapterNumber).toBe(chapterData.chapterNumber);
      expect(res.body.data.book).toBe(bookId.toString());

      const book = await BookModel.findById(bookId);
      expect(book.chapters).toHaveLength(1);
    });
  });

  describe("GET /api/books/:bookId/chapters", () => {
    it("should get all chapters for a book", async () => {
      await ChapterModel.create({
        title: "Chapter 1",
        content: "Content 1",
        chapterNumber: 1,
        book: bookId,
        author: userId,
      });
      await ChapterModel.create({
        title: "Chapter 2",
        content: "Content 2",
        chapterNumber: 2,
        book: bookId,
        author: userId,
      });

      const res = await request(app)
        .get(`/api/books/${bookId}/chapters`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].chapterNumber).toBe(1);
      expect(res.body.data[1].chapterNumber).toBe(2);
    });
  });

  describe("GET /api/chapters/:chapterId", () => {
    it("should get a single chapter by its ID", async () => {
      const chapter = await ChapterModel.create({
        title: "Test Chapter",
        content: "Test Content",
        chapterNumber: 1,
        book: bookId,
        author: userId,
      });

      const res = await request(app)
        .get(`/api/chapters/${chapter._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.title).toBe("Test Chapter");
      expect(res.body.data.chapterNumber).toBe(1);
    });
  });

  describe("PATCH /api/chapters/:chapterId", () => {
    it("should update a chapter", async () => {
      const chapter = await ChapterModel.create({
        title: "Old Title",
        content: "Old Content",
        chapterNumber: 1,
        book: bookId,
        author: userId,
      });

      const updateData = { title: "New Title", chapterNumber: 2 };

      const res = await request(app)
        .patch(`/api/chapters/${chapter._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.title).toBe("New Title");
      expect(res.body.data.chapterNumber).toBe(2);
    });
  });

  describe("DELETE /api/chapters/:chapterId", () => {
    it("should delete a chapter", async () => {
      const chapter = await ChapterModel.create({
        title: "To Be Deleted",
        content: "Content",
        chapterNumber: 1,
        book: bookId,
        author: userId,
      });
      const book = await BookModel.findById(bookId);
      book.chapters.push(chapter._id);
      await book.save();

      const res = await request(app)
        .delete(`/api/chapters/${chapter._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);

      const deletedChapter = await ChapterModel.findById(chapter._id);
      expect(deletedChapter).toBeNull();

      const updatedBook = await BookModel.findById(bookId);
      expect(updatedBook.chapters).toHaveLength(0);
    });
  });
});
