import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure that for a given book, chapter numbers are unique
chapterSchema.index({ book: 1, chapterNumber: 1 }, { unique: true });

const ChapterModel = mongoose.model("Chapter", chapterSchema);

export default ChapterModel;