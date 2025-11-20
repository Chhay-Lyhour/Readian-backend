import { Schema, model } from "mongoose";

const downloadSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    downloadDate: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
downloadSchema.index({ user: 1, book: 1 });
downloadSchema.index({ user: 1, downloadDate: -1 });

const DownloadModel = model("Download", downloadSchema);

export default DownloadModel;

