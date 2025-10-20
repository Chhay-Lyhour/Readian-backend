// File: src/config/db.ts
import mongoose from "mongoose";
import { config } from "./config";
import { Logger } from "../utils/logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    Logger.info("MongoDB connected successfully.");
  } catch (error) {
    Logger.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
