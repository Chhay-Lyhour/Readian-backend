import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, clearDB } from "../config/db.js";
import BookModel from "../models/bookModel.js";
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
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
  userId = user._id;

  const book = await BookModel.create({
    title: "Test Book",
    author: userId,
    chapter: 1,
  });
  bookId = book._id;

  token = jwt.sign({ id: userId }, config.jwtAccessSecret, {
    expiresIn: "1h",
  });
});

describe("Like Routes", () => {
  it("should allow a user to like a book", async () => {
    const res = await request(app)
      .post(`/api/books/${bookId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.message).toBe("Book liked successfully.");

    const book = await BookModel.findById(bookId);
    expect(book.likes).toBe(1);
    expect(book.likedBy).toContainEqual(userId);

    const user = await User.findById(userId);
    expect(user.likedBooks).toContainEqual(bookId);
  });

  it("should not allow a user to like a book twice", async () => {
    // First like the book
    await request(app)
      .post(`/api/books/${bookId}/like`)
      .set("Authorization", `Bearer ${token}`);

    // Then try to like it again
    const res = await request(app)
      .post(`/api/books/${bookId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toBe("You have already liked this book.");
  });

  it("should allow a user to unlike a book", async () => {
    // First like the book
    await request(app)
      .post(`/api/books/${bookId}/like`)
      .set("Authorization", `Bearer ${token}`);

    // Then unlike it
    const res = await request(app)
      .post(`/api/books/${bookId}/unlike`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.message).toBe("Book unliked successfully.");

    const book = await BookModel.findById(bookId);
    expect(book.likes).toBe(0);
    expect(book.likedBy).not.toContainEqual(userId);

    const user = await User.findById(userId);
    expect(user.likedBooks).not.toContainEqual(bookId);
  });

  it("should not allow a user to unlike a book they have not liked", async () => {
    const res = await request(app)
      .post(`/api/books/${bookId}/unlike`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toBe("You have not liked this book.");
  });
});
