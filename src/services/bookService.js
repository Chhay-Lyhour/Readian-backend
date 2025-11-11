import BookModel from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Creates a new book.
 * @param {object} bookData - The data for the new book.
 */
export async function createBook(bookData, authorId) {
  const book = new BookModel({ ...bookData, author: authorId });
  return book.save();
}

/**
 * Retrieves all books.
 */
export async function getAllBooks() {
  return BookModel.find({});
}

/**
 * Retrieves all books by a specific author.
 * @param {string} authorId - The ID of the author.
 */
export async function getBooksByAuthor(authorId) {
  return BookModel.find({ author: authorId });
}

/**
 * Retrieves a single book by its ID.
 * Enforces subscription check for premium books.
 * @param {string} bookId - The ID of the book.
 * @param {object} [tokenUser] - The authenticated user object from the JWT (optional).
 */
const getBookById = async (bookId, tokenUser) => {
  // Step 1: Atomically find the book and increment its view count.
  // We use { new: true } to get the document *after* the update has been applied.
  const book = await BookModel.findByIdAndUpdate(
    bookId,
    { $inc: { viewCount: 1 } },
    { new: true }
  );

  if (!book) {
    throw new AppError("BOOK_NOT_FOUND");
  }

  // --- THIS IS THE SECURITY CHECK ---
  // Step 2: Check if the book is premium. If it's not, we don't care
  // about subscriptions and will return the book at the end.
  if (book.isPremium) {
    // Step 3: The book is premium. First, check if a user is even logged in.
    // 'tokenUser' comes from your 'softAuth' middleware.
    // If 'tokenUser' is 'undefined', they are an anonymous user.
    if (!tokenUser || !tokenUser.id) {
      throw new AppError("SUBSCRIPTION_REQUIRED");
    }

    // Step 4: A user is logged in. Now, get their *latest* data from the database.
    // We can't trust the JWT token for this, as their subscription might have expired.
    const dbUser = await User.findById(tokenUser.id);
    if (!dbUser) {
      throw new AppError("USER_NOT_FOUND");
    }

    // Step 5: This is the "Key Check". We see if their subscription is 'active'
    // AND if the expiration date is still in the future.
    const isSubscriptionActive =
      dbUser.subscriptionStatus === "active" &&
      dbUser.subscriptionExpiresAt &&
      new Date() < new Date(dbUser.subscriptionExpiresAt);

    // Step 6: THE GATE.
    // If the 'isSubscriptionActive' check fails, block them.
    if (!isSubscriptionActive) {
      throw new AppError("SUBSCRIPTION_REQUIRED");
    }
  }

  // Step 7: If the book is not premium (Step 2 was false),
  // or if the user passed the subscription check (Step 6 was false),
  // we return the book.
  return book;
};

/**
 * Updates a book by its ID.
 * @param {string} bookId - The ID of the book to update.
 * @param {object} updateData - The data to update.
 */
export async function updateBookById(bookId, updateData, authorId) {
  const book = await BookModel.findById(bookId);
  if (!book) throw new AppError("BOOK_NOT_FOUND");

  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  const updatedBook = await BookModel.findByIdAndUpdate(bookId, updateData, {
    new: true,
  });
  return updatedBook;
}

/**
 * Deletes a book by its ID.
 * @param {string} bookId - The ID of the book to delete.
 */
export async function deleteBookById(bookId, authorId) {
  const book = await BookModel.findById(bookId);
  if (!book) throw new AppError("BOOK_NOT_FOUND");

  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  await BookModel.findByIdAndDelete(bookId);
  return { message: "Book deleted successfully." };
}

/**
 * Publishes a book.
 * @param {string} bookId - The ID of the book to publish.
 * @param {string} authorId - The ID of the author attempting to publish.
 */
export async function publishBook(bookId, authorId) {
  const book = await BookModel.findById(bookId);
  if (!book) throw new AppError("BOOK_NOT_FOUND");

  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  if (book.status === "published") {
    throw new AppError("BOOK_ALREADY_PUBLISHED", "This book is already published.");
  }

  book.status = "published";
  book.publishedDate = new Date();
  await book.save();

  return book;
}
