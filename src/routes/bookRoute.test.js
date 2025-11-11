import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, clearDB } from "../config/db.js";
import BookModel from "../models/bookModel.js";
import mongoose from "mongoose";

// --- TEST SETUP ---
beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDB();
});

// --- TESTS ---
describe("Book Routes: /api/books", () => {
  describe("GET /", () => {
    it("should return an empty array when no books exist", async () => {
      const response = await request(app).get("/api/books");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toEqual([]);
      expect(response.body.data.totalItems).toBe(0);
    });

    it("should return a paginated list of published books", async () => {
      // Create a user to be the author
      const authorId = new mongoose.Types.ObjectId();

      // Create sample books
      await BookModel.create([
        { title: "Published Book 1", status: "published", author: authorId },
        { title: "Published Book 2", status: "published", author: authorId },
        { title: "Draft Book", status: "draft", author: authorId }, // This should not be returned
      ]);

      const response = await request(app).get("/api/books?page=1&limit=5");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(2);
      expect(response.body.data.totalItems).toBe(2);
      expect(response.body.data.books[0].title).toBe("Published Book 1");
      expect(response.body.data.books[1].title).toBe("Published Book 2");
    });
  });
});
