import { Schema, model } from "mongoose";

// In JS, we define enums as an array of strings for validation
const UserRole = ["READER", "AUTHOR", "ADMIN"];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // Hide by default
    role: { type: String, enum: UserRole, default: "AUTHOR" },
    email_verified: { type: Boolean, default: false },
    last_login: { type: Date, default: null },

    // --- FIELDS FOR SUBSCRIPTION ---
    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive"], // Restricts the value to one of these two strings
      default: "inactive", // New users will not have an active subscription
    },
    subscriptionExpiresAt: {
      type: Date, // Stores the exact date and time the subscription ends
      default: null, // Default to null when no active subscription exists
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

const User = model("User", userSchema);

export { User, UserRole };
