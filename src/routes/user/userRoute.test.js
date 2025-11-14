import request from "supertest";
import app from "../../app.js";
import { connectDB, disconnectDB, clearDB } from "../../config/db.js";
import { User } from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import { config } from "../../config/config.js";

let userToken;
let userId;
let adminToken;
let adminId;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();

  // Create a regular user
  const regularUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "READER",
  });
  userId = regularUser._id;
  userToken = jwt.sign({ id: userId, role: "READER" }, config.jwtAccessSecret, {
    expiresIn: "1h",
  });

  // Create an admin user
  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "adminpassword",
    role: "ADMIN",
  });
  adminId = adminUser._id;
  adminToken = jwt.sign({ id: adminId, role: "ADMIN" }, config.jwtAccessSecret, {
    expiresIn: "1h",
  });
});

describe("User Routes", () => {
  describe("GET /api/users/me", () => {
    it("should return current user profile for authenticated user", async () => {
      const res = await request(app)
        .get(`/api/users/me`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toEqual(userId.toString());
      expect(res.body.data.email).toEqual("test@example.com");
      expect(res.body.data).not.toHaveProperty("password"); // Password should be hidden
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get(`/api/users/me`);

      expect(res.statusCode).toEqual(401);
      expect(res.body.error.message).toBe("Authentication token is invalid or missing.");
    });
  });

  describe("PUT /api/users/me", () => {
    it("should update current user profile for the authenticated user", async () => {
      const updatedName = "Updated Name";
      const res = await request(app)
        .patch(`/api/users/me`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: updatedName });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toEqual(updatedName);
    });

    it("should return 400 for invalid update data", async () => {
      const res = await request(app)
        .patch(`/api/users/me`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ email: "invalid-email" }); // Invalid email format

      expect(res.statusCode).toEqual(400);
      expect(res.body.error.message).toContain("Invalid email format");
    });
  });

  describe("Admin User Routes", () => {
    describe("GET /api/users/:id", () => {
      it("should return user profile for admin", async () => {
        const res = await request(app)
          .get(`/api/users/${userId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toEqual(userId.toString());
        expect(res.body.data.email).toEqual("test@example.com");
      });

      it("should return 403 if non-admin tries to access user profile by ID", async () => {
        const res = await request(app)
          .get(`/api/users/${userId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body.error.message).toBe("You do not have permission.");
      });

      it("should return 404 if user not found for admin", async () => {
        const nonExistentId = "60d0fe4f3a6b7c001c8a0000"; // A valid-looking but non-existent ID
        const res = await request(app)
          .get(`/api/users/${nonExistentId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.error.message).toBe("No user found with that ID.");
      });
    });

    describe("PATCH /api/users/:id", () => {
      it("should allow admin to update any user's profile", async () => {
        const updatedName = "Admin Updated Name";
        const res = await request(app)
          .patch(`/api/users/${userId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: updatedName });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toEqual(updatedName);
      });

      it("should return 403 if non-admin tries to update user profile by ID", async () => {
        const anotherUser = await User.create({
          name: "Another User",
          email: "another@example.com",
          password: "password123",
          role: "READER",
        });

        const res = await request(app)
          .patch(`/api/users/${anotherUser._id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ name: "Attempted Update" });

        expect(res.statusCode).toEqual(403);
        expect(res.body.error.message).toBe("You do not have permission.");
      });

      it("should return 400 for invalid update data by admin", async () => {
        const res = await request(app)
          .patch(`/api/users/${userId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ email: "invalid-email" }); // Invalid email format

        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toContain("Invalid email format");
      });
    });

    describe("DELETE /api/users/:id", () => {
      it("should allow admin to delete any user's profile", async () => {
        const res = await request(app)
          .delete(`/api/users/${userId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User deleted successfully.");

        const deletedUser = await User.findById(userId);
        expect(deletedUser).toBeNull();
      });

      it("should return 403 if non-admin tries to delete user profile by ID", async () => {
        const anotherUser = await User.create({
          name: "Another User",
          email: "another@example.com",
          password: "password123",
          role: "READER",
        });

        const res = await request(app)
          .delete(`/api/users/${anotherUser._id}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body.error.message).toBe("You do not have permission.");
      });

      it("should return 404 if user not found for deletion by admin", async () => {
        const nonExistentId = "60d0fe4f3a6b7c001c8a0000"; // A valid-looking but non-existent ID
        const res = await request(app)
          .delete(`/api/users/${nonExistentId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.error.message).toBe("No user found with that ID to delete.");
      });
    });
  });
});
