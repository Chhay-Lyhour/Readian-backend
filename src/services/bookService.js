import BookModel from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Creates a new book.
 * @param {object} bookData - The data for the new book.
 */
export async function createBook(bookData) {
  const book = new BookModel(bookData);
  return book.save();
}

/**
 * Retrieves all books.
 */
export async function getAllBooks() {
  return BookModel.find({});
}

/**
 * Retrieves a single book by its ID.
 * Enforces subscription check for premium books.
 * @param {string} bookId - The ID of the book.
 * @param {object} [tokenUser] - The authenticated user object from the JWT (optional).
 */
const getBookById = async (bookId, tokenUser) => {
  // Step 1: Get the book from the database to see its details.
  const book = await Book.findById(bookId);
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
export async function updateBookById(bookId, updateData) {
  const book = await BookModel.findByIdAndUpdate(bookId, updateData, {
    new: true,
  });
  if (!book) throw new AppError("BOOK_NOT_FOUND");
  return book;
}

/**
 * Deletes a book by its ID.
 * @param {string} bookId - The ID of the book to delete.
 */
export async function deleteBookById(bookId) {
  const book = await BookModel.findByIdAndDelete(bookId);
  if (!book) throw new AppError("BOOK_NOT_FOUND");
  return { message: "Book deleted successfully." };
}
