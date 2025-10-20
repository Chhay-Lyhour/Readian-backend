import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token_hash: { type: String, required: true },
  expires_at: { type: Date, required: true },
});

// TTL index to automatically delete expired tokens from the database
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = model("RefreshToken", refreshTokenSchema);

export { RefreshToken };
