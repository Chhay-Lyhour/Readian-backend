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

// Validate SendGrid configuration
if (!process.env.SENDGRID_API_KEY) {
  console.error("FATAL ERROR: SENDGRID_API_KEY is not defined.");
  console.error("Get your API key from: https://app.sendgrid.com/settings/api_keys");
  process.exit(1);
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  console.error("FATAL ERROR: SENDGRID_FROM_EMAIL is not defined.");
  console.error("Verify your sender at: https://app.sendgrid.com/settings/sender_auth");
  process.exit(1);
}

// Validate SendGrid API key format
if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.error("FATAL ERROR: SENDGRID_API_KEY appears to be invalid (must start with 'SG.')");
  process.exit(1);
}

const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "",
  testMongoUri: process.env.TEST_MONGO_URI || "",

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "3600", // 60 minutes (60 * 60 = 3600 seconds)
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "1209600", // 14 days (14 * 24 * 60 * 60 = 1209600 seconds)

  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS || "12",

  emailVerificationExpiry: process.env.EMAIL_VERIFICATION_EXPIRY || "900",

  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || process.env.FROM_EMAIL,
};

export { config };
