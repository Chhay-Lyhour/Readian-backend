import dotenv from "dotenv";

dotenv.config();

// Validate JWT secrets at startup
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("FATAL ERROR: JWT secrets are not defined.");
  process.exit(1);
}

if (!process.env.MONGO_URI || !process.env.TEST_MONGO_URI) {
  console.error("FATAL ERROR: MongoDB URI is not defined.");
  process.exit(1);
}

const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  mongoUri: process.env.MONGO_URI || "",
  testMongoUri: process.env.TEST_MONGO_URI || "",

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  aba: {
    merchantId: process.env.ABA_MERCHANT_ID,
    apiKey: process.env.ABA_API_KEY,
    paywayApiUrl: process.env.ABA_PAYWAY_API_URL || "https://payway-sandbox.ababank.com",
    returnUrl: process.env.ABA_RETURN_URL,
    continueSuccessUrl: process.env.ABA_CONTINUE_SUCCESS_URL,
  },
};

export { config };
