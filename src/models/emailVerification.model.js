// File: src/models/emailVerification.model.ts
import { Schema, model, Document } from "mongoose";

export interface IEmailVerification extends Document {
  email: string;
  code: string;
  expires_at: Date;
  type: "registration" | "password_reset";
  verified: boolean;
}

const EmailVerificationSchema =
  new Schema() <
  IEmailVerification >
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
    expires_at: { type: Date, required: true },
    type: {
      type: String,
      enum: ["registration", "password_reset"],
      required: true,
    },
    verified: { type: Boolean, default: false },
  };

export const EmailVerificationModel =
  model < IEmailVerification > ("EmailVerification", EmailVerificationSchema);
