import { Schema, model } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    chapter: {
      type: Number,
      required: [true, "Chapter is required"],
      default: 0,
    },
    tableOfContents: String,
    readingTime: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: String,
    genre: String,
    rating: Number,
    image: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    isPremium: Boolean,
    publishedDate: Date,
    description: String,
    viewCount: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const BookModel = model("Book", bookSchema);

export default BookModel;
