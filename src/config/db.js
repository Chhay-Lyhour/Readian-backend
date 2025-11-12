import mongoose from "mongoose";
import { config } from "./config.js";
import "dotenv/config";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.NODE_ENV === "test" ? config.testMongoUri : config.mongoUri;
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // Exit process with failure
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error("MongoDB disconnection failed:", error);
    process.exit(1);
  }
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export { connectDB, disconnectDB, clearDB };
