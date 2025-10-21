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
    role: { type: String, enum: UserRole, default: "READER" },
    email_verified: { type: Boolean, default: false },
    last_login: { type: Date, default: null },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const User = model("User", userSchema);

export { User, UserRole };
