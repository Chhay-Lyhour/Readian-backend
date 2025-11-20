import { Schema, model } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    readingTime: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: String,
    genre: String,
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    image: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    bookStatus: {
      type: String,
      enum: ["ongoing", "finished"],
      default: "ongoing",
    },
    isPremium: Boolean,
    publishedDate: Date,
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
    downloadCount: {
      type: Number,
      default: 0,
    },
    allowDownload: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const BookModel = model("Book", bookSchema);

export default BookModel;
