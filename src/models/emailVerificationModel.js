import { Schema, model } from "mongoose";

const VerificationType = ["registration", "password_reset"];

const emailVerificationSchema = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  type: { type: String, enum: VerificationType, required: true },
  verified: { type: Boolean, default: false },
  expires_at: { type: Date, required: true },
});

// TTL index for automatic cleanup
emailVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = model("EmailVerification", emailVerificationSchema);

export { EmailVerification, VerificationType };
