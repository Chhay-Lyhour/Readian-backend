// File: src/models/user.model.ts
import { Schema, model, Document } from "mongoose";
import { UserRole } from "../types/enums";

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  email_verified: boolean;
  last_login?: Date;
}

const UserSchema =
  new Schema() <
  IUser >
  ({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["BUYER", "SELLER", "ADMIN"],
      default: "BUYER",
    },
    email_verified: { type: Boolean, default: false },
    last_login: { type: Date },
  },
  { timestamps: true });

export const UserModel = model < IUser > ("User", UserSchema);
