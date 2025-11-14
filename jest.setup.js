// jest.setup.js
import { connectDB, disconnectDB } from './src/config/db.js';
import dotenv from "dotenv";

process.env.NODE_ENV = "test";
process.env.TEST_MONGO_URI = "mongodb://localhost:27017/readian_test";
dotenv.config(); // Load environment variables after setting NODE_ENV and TEST_MONGO_URI

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

jest.doMock("./src/config/config.js", () => ({
  config: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "mock_access_secret",
    aba: {
      merchantId: process.env.ABA_MERCHANT_ID || "mock_merchant_id",
      apiKey: process.env.ABA_API_KEY || "mock_api_key",
      paywayApiUrl: process.env.ABA_PAYWAY_API_URL || "http://mock-aba-payway.com",
      returnUrl: process.env.ABA_RETURN_URL || "http://localhost:3000/payment-return",
      continueSuccessUrl: process.env.ABA_CONTINUE_SUCCESS_URL || "http://localhost:3000/payment-success",
    },
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    testMongoUri: process.env.TEST_MONGO_URI,
  },
}));
