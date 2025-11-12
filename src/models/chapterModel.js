import { Schema, model } from "mongoose";

const chapterSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Chapter title is required"],
    },
    content: {
      type: String,
      required: [true, "Chapter content is required"],
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

chapterSchema.index({ book: 1, chapterNumber: 1 }, { unique: true });

const ChapterModel = model("Chapter", chapterSchema);

export default ChapterModel;
