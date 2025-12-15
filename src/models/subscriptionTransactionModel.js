import mongoose from "mongoose";

const subscriptionTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["basic", "premium"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    transactionType: {
      type: String,
      enum: ["new", "renewal", "upgrade"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient analytics queries
subscriptionTransactionSchema.index({ createdAt: 1 });
subscriptionTransactionSchema.index({ user: 1, createdAt: 1 });
subscriptionTransactionSchema.index({ plan: 1, createdAt: 1 });
subscriptionTransactionSchema.index({ status: 1, createdAt: 1 });

const SubscriptionTransactionModel = mongoose.model(
  "SubscriptionTransaction",
  subscriptionTransactionSchema
);

export default SubscriptionTransactionModel;

