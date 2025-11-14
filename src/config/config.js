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

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "900",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "1209600",

  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS || "12",

  emailVerificationExpiry: process.env.EMAIL_VERIFICATION_EXPIRY || "900",

  gmailHost: process.env.GMAIL_HOST,
  gmailUser: process.env.GMAIL_USER,
  gmailPass: process.env.GMAIL_PASS,
  fromEmail: process.env.FROM_EMAIL,
};

export { config };
