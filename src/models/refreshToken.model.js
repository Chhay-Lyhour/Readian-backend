// File: src/models/refreshToken.model.ts
import { Schema, model, Document } from "mongoose";

export interface IRefreshToken extends Document {
  user_id: Schema.Types.ObjectId;
  token_hash: string;
  expires_at: Date;
}

const RefreshTokenSchema =
  new Schema() <
  IRefreshToken >
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token_hash: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true },
  };

export const RefreshTokenModel =
  model < IRefreshToken > ("RefreshToken", RefreshTokenSchema);
