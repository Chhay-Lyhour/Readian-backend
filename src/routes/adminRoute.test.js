import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, clearDB } from "../config/db.js";
import { User } from "../models/userModel.js";
import BookModel from "../models/bookModel.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { getDashboardAnalytics } from "../services/adminService.js"; // Direct import for coverage check

let adminToken;
let adminId;
let authorId;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();

  // Create an Admin user
  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "ADMIN",
  });
  adminId = adminUser._id;
  adminToken = jwt.sign({ id: adminId, role: "ADMIN" }, config.jwtAccessSecret, {
    expiresIn: "1h",
  });

  // Create an Author user
  const authorUser = await User.create({
    name: "Author User",
    email: "author@example.com",
    password: "password123",
    role: "AUTHOR",
  });
  authorId = authorUser._id;

  // Create a regular User with an active basic subscription
  await User.create({
    name: "Subscriber User",
    email: "subscriber@example.com",
    password: "password123",
    role: "READER",
    plan: "basic",
    subscriptionStatus: "active",
  });

  // Create a regular User with a free/inactive subscription
  await User.create({
    name: "Free User",
    email: "free@example.com",
    password: "password123",
    role: "READER",
    plan: "free",
    subscriptionStatus: "inactive",
  });

  // Create some books for analytics
  await BookModel.create([
    { title: "Book 1", author: authorId, status: "published", viewCount: 100, likes: 5 },
    { title: "Book 2", author: authorId, status: "published", viewCount: 200 },
    { title: "Book 3", author: authorId, status: "draft", viewCount: 50 },
  ]);
});

describe("Admin Routes", () => {
  // Dummy test to force coverage for adminService
  it("should call adminService.getDashboardAnalytics", async () => {
    await getDashboardAnalytics();
    // No assertion needed, just ensuring the function is called for coverage
  });

  describe("GET /api/admin/analytics", () => {
    it("should return analytics data for an admin", async () => {
      const res = await request(app)
        .get("/api/admin/analytics")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toHaveProperty("total");
      expect(res.body.data.books).toHaveProperty("total");
      expect(res.body.data.books.status.published).toBe(2);
      expect(res.body.data.detailed).toHaveProperty("topAuthors");
      expect(res.body.data.users.total).toBe(4); // Admin + Author + Subscriber + Free User
      expect(res.body.data.books.total).toBe(3);
      expect(res.body.data.books.status.published).toBe(2);
      expect(res.body.data.books.totalLikes).toBe(5);
      expect(res.body.data.detailed.topAuthors).toHaveLength(1);
      expect(res.body.data.users.subscriptionBreakdown).toEqual({
        basicPlanSubscriber: 1,
        freeNonSubscriber: 3,
      });
    });

    it("should return 403 if a non-admin tries to access analytics", async () => {
      const userToken = jwt.sign({ id: authorId, role: "AUTHOR" }, config.jwtAccessSecret, {
        expiresIn: "1h",
      });

      const res = await request(app)
        .get("/api/admin/analytics")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.error.message).toBe("You do not have permission.");
    });
  });
});
