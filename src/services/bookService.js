import BookModel from "../models/bookModel.js";
import ChapterModel from "../models/chapterModel.js";
import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";
import { uploadFromBuffer } from "./uploadService.js";
import { calculateReadingTime } from "../utils/readingTimeCalculator.js";
import { checkAndHandleExpiredSubscription } from "./subscriptionService.js";
import mongoose from "mongoose";

/**
 * Creates a new book and its chapters, and calculates the reading time.
 * @param {object} bookData - The data for the new book, including chapters.
 * @param {string} authorId - The ID of the author.
 * @param {object} file - The uploaded file for the book cover.
 */
export async function createBook(bookData, authorId, file) {
  const { chapters, ...restOfBookData } = bookData;

  if (file) {
    const imageUrl = await uploadFromBuffer(file.buffer, "book_covers");
    restOfBookData.image = imageUrl;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book = new BookModel({ ...restOfBookData, author: authorId });

    const totalContent = chapters.map((c) => c.content).join(" ");
    book.readingTime = calculateReadingTime(totalContent);

    await book.save({ session });

    const chapterDocs = chapters.map((chapter, index) => ({
      ...chapter,
      book: book._id,
      chapterNumber: index + 1,
    }));

    await ChapterModel.insertMany(chapterDocs, { session });

    await session.commitTransaction();
    return book;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Retrieves all books with pagination.
 * @param {object} options - Pagination options.
 * @param {number} options.page - The current page.
 * @param {number} options.limit - The number of items per page.
 * @param {object} options.user - The logged-in user (optional, from softAuth).
 */
export async function getAllBooks({ page, limit, user }) {
  const skip = (page - 1) * limit;
  const query = { status: "published" };

  // Apply age-based content filtering
  // Only filter out adult content if user is not logged in OR is under 18
  if (!user || !user.age || user.age < 18) {
    // Exclude adult content - show kids, teen, and books without contentType (null or missing field)
    query.$or = [
      { contentType: { $in: ["kids", "teen"] } },
      { contentType: null },
      { contentType: { $exists: false } }
    ];
  }
  // If user is logged in AND 18+, show all content including adult (no filter added)

  const [books, totalItems] = await Promise.all([
    BookModel.find(query).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
    BookModel.countDocuments(query),
  ]);

  // Add total chapters count for each book
  const booksWithChapterCount = await Promise.all(
    books.map(async (book) => {
      const totalChapters = await ChapterModel.countDocuments({ book: book._id });
      return { ...book, totalChapters };
    })
  );

  const totalPages = Math.ceil(totalItems / limit);

  return {
    books: booksWithChapterCount,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalBooks: totalItems,
      hasMore: page < totalPages
    }
  };
}

/**
 * Retrieves all books by a specific author.
 * Only returns books that belong to the specified author (never returns other authors' books).
 * @param {string} authorId - The ID of the author.
 * @param {object} options - Optional filtering and pagination options.
 * @param {string} options.status - Filter by status: 'draft' or 'published' (optional).
 * @param {number} options.page - Page number for pagination (optional).
 * @param {number} options.limit - Number of items per page (optional).
 */
export async function getBooksByAuthor(authorId, options = {}) {
  const { status, page, limit } = options;

  // Build query - always filter by author to ensure they only see their own books
  const query = { author: authorId };

  // Optional status filter
  if (status) {
    query.status = status;
  }

  // If no pagination provided, return all books (backward compatibility)
  if (!page && !limit) {
    const books = await BookModel.find(query).sort({ createdAt: -1 }).lean();
    // Add chapter count to each book
    const booksWithChapterCount = await Promise.all(
      books.map(async (book) => {
        const totalChapters = await ChapterModel.countDocuments({ book: book._id });
        return { ...book, totalChapters };
      })
    );
    return booksWithChapterCount;
  }

  // Calculate pagination
  const pageNum = page || 1;
  const limitNum = limit || 10;
  const skip = (pageNum - 1) * limitNum;

  // Execute query with pagination
  const [books, totalItems] = await Promise.all([
    BookModel.find(query)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limitNum)
      .lean(),
    BookModel.countDocuments(query),
  ]);

  // Add chapter count to each book
  const booksWithChapterCount = await Promise.all(
    books.map(async (book) => {
      const totalChapters = await ChapterModel.countDocuments({ book: book._id });
      return { ...book, totalChapters };
    })
  );

  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    books: booksWithChapterCount,
    pagination: {
      currentPage: pageNum,
      totalPages: totalPages,
      totalBooks: totalItems,
      hasMore: pageNum < totalPages
    }
  };
}

/**
 * Retrieves a single book by its ID.
 * Enforces subscription check for premium books.
 * @param {string} bookId - The ID of the book.
 * @param {object} [tokenUser] - The authenticated user object from the JWT (optional).
 */
export const getBookById = async (
  bookId,
  tokenUser,
  { chapterPage = 1, chapterLimit = 10 }
) => {
  // Step 1: Find the book first and populate author details.
  const book = await BookModel.findById(bookId)
    .populate('author', 'name email avatar')
    .lean();

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
      throw new AppError("BOOK_NOT_FOUND");
    }
  }

  // --- INCREMENT VIEW COUNT ---
  // We can do this in the background as it doesn't need to block the response.
  BookModel.findByIdAndUpdate(bookId, { $inc: { viewCount: 1 } }).exec();

  // --- PREMIUM CONTENT CHECK ---
  if (book.isPremium) {
    if (!tokenUser || !tokenUser.id) {
      throw new AppError("SUBSCRIPTION_REQUIRED");
    }

    const dbUser = await User.findById(tokenUser.id);
    if (!dbUser) {
      throw new AppError("USER_NOT_FOUND");
    }

    // Allow the author to view their own premium book and admins to view all
    const isBookAuthor = book.author.toString() === tokenUser.id;
    const isAdmin = tokenUser.role === "ADMIN";

    if (!isBookAuthor && !isAdmin) {
      // Check and handle expired subscriptions (auto-downgrade to free)
      await checkAndHandleExpiredSubscription(dbUser);

      const isSubscriptionActive =
        dbUser.subscriptionStatus === "active" &&
        dbUser.subscriptionExpiresAt &&
        new Date() < new Date(dbUser.subscriptionExpiresAt);

      if (!isSubscriptionActive) {
        throw new AppError("SUBSCRIPTION_REQUIRED");
      }
    }
  }

  // --- FETCH CHAPTERS AND TABLE OF CONTENTS ---
  const skip = (chapterPage - 1) * chapterLimit;

  const [chapters, totalChapters, tableOfContents] = await Promise.all([
    ChapterModel.find({ book: bookId })
      .sort({ chapterNumber: 1 })
      .skip(skip)
      .limit(chapterLimit)
      .lean(),
    ChapterModel.countDocuments({ book: bookId }),
    ChapterModel.find({ book: bookId })
      .sort({ chapterNumber: 1 })
      .select("title")
      .lean(),
  ]);

  return {
    ...book,
    chapters,
    tableOfContents: tableOfContents.map((c) => c.title),
    chapterPagination: {
      totalPages: Math.ceil(totalChapters / chapterLimit),
      currentPage: chapterPage,
      totalChapters,
    },
  };
};

export async function searchAndFilterBooks(
  searchCriteria,
  userPlan,
  { page, limit },
  user
) {
  const { title, author, genre, tags, sortByLikes } = searchCriteria;
  const query = { status: "published" };
  const sortOption = {};

  // Apply age-based content filtering
  // Only filter out adult content if user is not logged in OR is under 18
  if (!user || !user.age || user.age < 18) {
    // Exclude adult content - show kids, teen, and books without contentType (null or missing field)
    query.$or = [
      { contentType: { $in: ["kids", "teen"] } },
      { contentType: null },
      { contentType: { $exists: false } }
    ];
  }
  // If user is logged in AND 18+, show all content including adult (no filter added)

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
    if (sortByLikes) {
      sortOption.likes = sortByLikes;
    }
  } else if (genre || tags || sortByLikes) {
    // If a non-premium user tries to filter, throw an error
    throw new AppError(
      "PREMIUM_FEATURE_ONLY",
      "Filtering by genre, tags, or sorting by likes is a premium feature."
    );
  }

  const skip = (page - 1) * limit;
  const [books, totalItems] = await Promise.all([
    BookModel.find(query).sort(sortOption).skip(skip).limit(limit),
    BookModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  return {
    books,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalBooks: totalItems,
      hasMore: page < totalPages
    }
  };
}

/**
 * Updates a book by its ID. If chapters are provided, they are replaced.
 * @param {string} bookId - The ID of the book to update.
 * @param {object} updateData - The data to update, may include chapters.
 * @param {string} authorId - The ID of the author making the update.
 * @param {object} file - An optional file for the book's cover image.
 */
export async function updateBookById(bookId, updateData, authorId, file) {
  const book = await BookModel.findById(bookId);
  if (!book) {
    throw new AppError("BOOK_NOT_FOUND");
  }

  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  if (file) {
    const imageUrl = await uploadFromBuffer(file.buffer, "book_covers", file.originalname);
    updateData.image = imageUrl;
  }

  const { chapters, ...restOfUpdateData } = updateData;

  // If chapters are part of the update, handle them in a transaction
  if (chapters && chapters.length > 0) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Delete old chapters
      await ChapterModel.deleteMany({ book: bookId }, { session });

      // 2. Create new chapters
      const chapterDocs = chapters.map((chapter, index) => ({
        ...chapter,
        book: bookId,
        chapterNumber: index + 1,
      }));
      await ChapterModel.insertMany(chapterDocs, { session });

      // 3. Recalculate reading time
      const totalContent = chapters.map((c) => c.content).join(" ");
      restOfUpdateData.readingTime = calculateReadingTime(totalContent);

      // 4. Update the book itself
      const updatedBook = await BookModel.findByIdAndUpdate(
        bookId,
        restOfUpdateData,
        { new: true, session }
      );

      await session.commitTransaction();
      return updatedBook;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } else {
    // If no chapters are being updated, just update the book metadata
    const updatedBook = await BookModel.findByIdAndUpdate(
      bookId,
      restOfUpdateData,
      {
        new: true,
      }
    );
    return updatedBook;
  }
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
    throw new AppError(
      "BOOK_ALREADY_PUBLISHED",
      "This book is already published."
    );
  }

  book.status = "published";
  book.publishedDate = new Date();
  await book.save();

  return book;
}

/**
 * Toggles the premium status of a book.
 * @param {string} bookId - The ID of the book.
 * @param {string} authorId - The ID of the author attempting to toggle.
 */
export async function togglePremiumStatus(bookId, authorId) {
  const book = await BookModel.findById(bookId);
  if (!book) throw new AppError("BOOK_NOT_FOUND");

  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  // Toggle the premium status
  book.isPremium = !book.isPremium;
  await book.save();

  return book;
}

/**
 * Updates the book status (ongoing/finished).
 * @param {string} bookId - The ID of the book.
 * @param {string} bookStatus - The new status ('ongoing' or 'finished').
 * @param {string} authorId - The ID of the author attempting to update.
 */
export async function updateBookStatus(bookId, bookStatus, authorId) {
  const book = await BookModel.findById(bookId);
  if (!book) throw new AppError("BOOK_NOT_FOUND");

  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  // Validate bookStatus
  if (!["ongoing", "finished"].includes(bookStatus)) {
    throw new AppError(
      "INVALID_BOOK_STATUS",
      "Book status must be 'ongoing' or 'finished'."
    );
  }

  book.bookStatus = bookStatus;
  await book.save();

  return book;
}

/**
 * Updates the content type of a book (kids or adult).
 * Only the author of the book can update the content type.
 * @param {string} bookId - The ID of the book.
 * @param {string} contentType - The new content type ('kids' or 'adult').
 * @param {string} authorId - The ID of the author making the request.
 * @returns {Promise<Book>} - The updated book document.
 */
export async function updateContentType(bookId, contentType, authorId) {
  const book = await BookModel.findById(bookId);
  if (!book) throw new AppError("BOOK_NOT_FOUND");

  if (book.author.toString() !== authorId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  }

  // Validate contentType
  if (!["kids", "adult"].includes(contentType)) {
    throw new AppError(
      "INVALID_CONTENT_TYPE",
      "Content type must be 'kids' or 'adult'."
    );
  }

  book.contentType = contentType;
  await book.save();

  return book;
}

/**
 * Retrieves all chapters for a book with pagination.
 * Enforces subscription check for premium books.
 * @param {string} bookId - The ID of the book.
 * @param {object} [tokenUser] - The authenticated user object from the JWT (optional).
 * @param {object} options - Pagination options.
 */
export async function getBookChapters(bookId, tokenUser, { chapterPage = 1, chapterLimit = 10 }) {
  // Step 1: Find the book first.
  const book = await BookModel.findById(bookId).lean();

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
      throw new AppError("BOOK_NOT_FOUND");
    }
  }

  // --- PREMIUM CONTENT CHECK ---
  if (book.isPremium) {
    if (!tokenUser || !tokenUser.id) {
      throw new AppError("SUBSCRIPTION_REQUIRED");
    }

    const dbUser = await User.findById(tokenUser.id);
    if (!dbUser) {
      throw new AppError("USER_NOT_FOUND");
    }

    // Allow the author to view their own premium book and admins to view all
    const isBookAuthor = book.author.toString() === tokenUser.id;
    const isAdmin = tokenUser.role === "ADMIN";

    if (!isBookAuthor && !isAdmin) {
      // Check and handle expired subscriptions (auto-downgrade to free)
      await checkAndHandleExpiredSubscription(dbUser);

      const isSubscriptionActive =
        dbUser.subscriptionStatus === "active" &&
        dbUser.subscriptionExpiresAt &&
        new Date() < new Date(dbUser.subscriptionExpiresAt);

      if (!isSubscriptionActive) {
        throw new AppError("SUBSCRIPTION_REQUIRED");
      }
    }
  }

  // --- FETCH CHAPTERS ---
  const skip = (chapterPage - 1) * chapterLimit;

  const [chapters, totalChapters] = await Promise.all([
    ChapterModel.find({ book: bookId })
      .sort({ chapterNumber: 1 })
      .skip(skip)
      .limit(chapterLimit)
      .lean(),
    ChapterModel.countDocuments({ book: bookId }),
  ]);

  return {
    bookId: book._id,
    bookTitle: book.title,
    chapters,
    pagination: {
      totalPages: Math.ceil(totalChapters / chapterLimit),
      currentPage: chapterPage,
      totalChapters,
    },
  };
}

/**
 * Retrieves a specific chapter by its chapter number.
 * Enforces subscription check for premium books.
 * @param {string} bookId - The ID of the book.
 * @param {number} chapterNumber - The chapter number to retrieve.
 * @param {object} [tokenUser] - The authenticated user object from the JWT (optional).
 */
export async function getChapterByNumber(bookId, chapterNumber, tokenUser) {
  // Step 1: Find the book first.
  const book = await BookModel.findById(bookId).lean();

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
      throw new AppError("BOOK_NOT_FOUND");
    }
  }

  // --- PREMIUM CONTENT CHECK ---
  if (book.isPremium) {
    if (!tokenUser || !tokenUser.id) {
      throw new AppError("SUBSCRIPTION_REQUIRED");
    }

    const dbUser = await User.findById(tokenUser.id);
    if (!dbUser) {
      throw new AppError("USER_NOT_FOUND");
    }

    // Allow the author to view their own premium book and admins to view all
    const isBookAuthor = book.author.toString() === tokenUser.id;
    const isAdmin = tokenUser.role === "ADMIN";

    if (!isBookAuthor && !isAdmin) {
      // Check and handle expired subscriptions (auto-downgrade to free)
      await checkAndHandleExpiredSubscription(dbUser);

      const isSubscriptionActive =
        dbUser.subscriptionStatus === "active" &&
        dbUser.subscriptionExpiresAt &&
        new Date() < new Date(dbUser.subscriptionExpiresAt);

      if (!isSubscriptionActive) {
        throw new AppError("SUBSCRIPTION_REQUIRED");
      }
    }
  }

  // --- FETCH SPECIFIC CHAPTER ---
  const chapter = await ChapterModel.findOne({
    book: bookId,
    chapterNumber: chapterNumber,
  }).lean();

  if (!chapter) {
    throw new AppError("CHAPTER_NOT_FOUND", "Chapter not found.");
  }

  // Get total chapter count for navigation
  const totalChapters = await ChapterModel.countDocuments({ book: bookId });

  return {
    ...chapter,
    bookTitle: book.title,
    navigation: {
      hasNext: chapterNumber < totalChapters,
      hasPrevious: chapterNumber > 1,
      totalChapters,
    },
  };
}
