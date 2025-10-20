import mongoose from "mongoose";
const bookSchema = new mongoose.Schema(
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
    author: String,
    tags: String,
    genre: String,
    liked: {
      type: Number,
      default: 0,
    },
    rating: Number,
    review: String,
    image: {
      type: String,
      required: false,
    },
    isCompleted: Boolean,
    isPremium: Boolean,
    publishedDate: Date,
    description: String,
  },
  {
    timestamps: true,
  }
);

const BookModel = mongoose.model("Book", bookSchema);

export default BookModel;
