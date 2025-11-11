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
 * Retrieves all books with pagination.
 * @param {object} options - Pagination options.
 * @param {number} options.page - The current page.
 * @param {number} options.limit - The number of items per page.
 */
export async function getAllBooks({ page, limit }) {
  const skip = (page - 1) * limit;
  const query = { status: "published" };
  const [books, totalItems] = await Promise.all([
    BookModel.find(query).skip(skip).limit(limit),
    BookModel.countDocuments(query),
  ]);

  return {
    books,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    totalItems,
  };
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
export const getBookById = async (bookId, tokenUser) => {
  // Step 1: Find the book first, without incrementing the view count yet.
  const book = await BookModel.findById(bookId);

  // Step 2: If no book is found, exit immediately.
  if (!book) {
    throw new AppError("BOOK_NOT_FOUND");
  }

  // --- DRAFT VISIBILITY CHECK ---
  // Step 3: If the book is a draft, only its author or an admin can see it.
  if (book.status === "draft") {
    const isAuthor = tokenUser && book.author.toString() === tokenUser.id;
    const isAdmin = tokenUser && tokenUser.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      // Treat it as if it doesn't exist for unauthorized users.
      throw new AppError("BOOK_NOT_FOUND");
    }
  }

  // --- INCREMENT VIEW COUNT ---
  // Step 4: Now that we know the user can view the book, increment the view count.
  // We do this separately to avoid incrementing views for unauthorized access attempts.
  book.viewCount += 1;
  await book.save();

  // --- PREMIUM CONTENT CHECK ---
  // Step 5: Check if the book is premium.
  if (book.isPremium) {
    if (!tokenUser || !tokenUser.id) {
      throw new AppError("SUBSCRIPTION_REQUIRED");
    }

    const dbUser = await User.findById(tokenUser.id);
    if (!dbUser) {
      throw new AppError("USER_NOT_FOUND");
    }

    const isSubscriptionActive =
      dbUser.subscriptionStatus === "active" &&
      dbUser.subscriptionExpiresAt &&
      new Date() < new Date(dbUser.subscriptionExpiresAt);

    if (!isSubscriptionActive) {
      throw new AppError("SUBSCRIPTION_REQUIRED");
    }
  }

  // Step 6: Return the book.
  return book;
};

export async function searchAndFilterBooks(
  searchCriteria,
  userPlan,
  { page, limit }
) {
  const { title, author, genre, tags } = searchCriteria;
  const query = { status: "published" };

  if (title) {
    query.title = { $regex: title, $options: "i" };
  }

  if (author) {
    // Find user IDs for author names
    const users = await User.find({ name: { $regex: author, $options: "i" } });
    const userIds = users.map((user) => user._id);
    query.author = { $in: userIds };
  }

  if (userPlan === "premium") {
    if (genre) {
      query.genre = { $regex: genre, $options: "i" };
    }
    if (tags) {
      query.tags = { $regex: tags, $options: "i" };
    }
  } else if (genre || tags) {
    // If a non-premium user tries to filter, throw an error
    throw new AppError(
      "PREMIUM_FEATURE_ONLY",
      "Filtering by genre or tags is a premium feature."
    );
  }

  const skip = (page - 1) * limit;
  const [books, totalItems] = await Promise.all([
    BookModel.find(query).skip(skip).limit(limit),
    BookModel.countDocuments(query),
  ]);

  return {
    books,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    totalItems,
  };
}

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
