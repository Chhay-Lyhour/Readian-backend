import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, clearDB } from "../config/db.js";
import BookModel from "../models/bookModel.js";
import { User } from "../models/userModel.js";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();
  const user1 = await User.create({
    name: "Author 1",
    email: "author1@example.com",
    password: "password",
  });
  const user2 = await User.create({
    name: "Author 2",
    email: "author2@example.com",
    password: "password",
  });

  await BookModel.create([
    { title: "Book 1", author: user1._id, status: "published", viewCount: 100, chapter: 1 },
    { title: "Book 2", author: user2._id, status: "published", viewCount: 200, chapter: 1 },
    { title: "Book 3", author: user1._id, status: "published", viewCount: 50, chapter: 1 },
    { title: "Book 4", author: user2._id, status: "published", viewCount: 300, chapter: 1 },
    { title: "Book 5", author: user1._id, status: "published", viewCount: 150, chapter: 1 },
    { title: "Book 6", author: user2._id, status: "draft", viewCount: 500, chapter: 1 },
  ]);
});

describe("Public Analytics Route", () => {
  it("should return the top 5 most viewed books and authors", async () => {
    const res = await request(app).get("/api/analytics/public");

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    // Check top books
    expect(res.body.data.topBooks).toHaveLength(5);
    expect(res.body.data.topBooks[0].title).toBe("Book 4");
    expect(res.body.data.topBooks[0].viewCount).toBe(300);

    // Check top authors
    expect(res.body.data.topAuthors).toHaveLength(2);
    expect(res.body.data.topAuthors[0].authorName).toBe("Author 2");
    expect(res.body.data.topAuthors[0].totalViews).toBe(500);
    expect(res.body.data.topAuthors[1].authorName).toBe("Author 1");
    expect(res.body.data.topAuthors[1].totalViews).toBe(300);
  });
});
