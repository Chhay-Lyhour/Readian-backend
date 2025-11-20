import * as userRepo from "../repositories/userRepositories.js";
import { AppError } from "../utils/errorHandler.js";
import { uploadFromBuffer } from "./uploadService.js";
import BookModel from "../models/bookModel.js";
import mongoose from "mongoose";

/**
 * Updates the profile image for a user.
 * @param {string} userId - The ID of the user.
 * @param {object} file - The file object from multer.
 */
export async function updateUserProfileImage(userId, file) {
  // Upload the new avatar to Cloudinary or local storage
  const imageUrl = await uploadFromBuffer(file.buffer, "profile_images", file.originalname);

  // Update the user's avatar URL in the database
  const updatedUser = await userRepo.updateUserById(userId, {
    avatar: imageUrl,
  });

  if (!updatedUser) {
    throw new AppError("USER_NOT_FOUND", "Could not update profile image.");
  }

  return updatedUser;
}

/**
 * Updates the cover image for a user.
 * @param {string} userId - The ID of the user.
 * @param {object} file - The file object from multer.
 */
export async function updateUserCoverImage(userId, file) {
  // Upload the new cover image to Cloudinary or local storage
  const imageUrl = await uploadFromBuffer(file.buffer, "cover_images", file.originalname);

  // Update the user's coverImage URL in the database
  const updatedUser = await userRepo.updateUserById(userId, {
    coverImage: imageUrl,
  });

  if (!updatedUser) {
    throw new AppError("USER_NOT_FOUND", "Could not update cover image.");
  }

  return updatedUser;
}

/**
 * Retrieves all users. (Admin only)
 */
export async function getAllUsers() {
  const users = await userRepo.findAllUsers();
  return users;
}

/**
 * Retrieves a single user by their ID. (Admin only)
 * @param {string} userId - The ID of the user.
 */
export async function getUserById(userId) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new AppError("USER_NOT_FOUND", "No user found with that ID.");
  }
  return user;
}

/**
 * Upgrades a user's role to AUTHOR.
 * @param {string} userId - The ID of the user requesting the upgrade.
 */
export async function upgradeToAuthor(userId) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new AppError("USER_NOT_FOUND");
  }

  // Business Rule: Only allow READER or BUYER to become AUTHOR.
  // Handle legacy roles like SELLER by allowing them to become AUTHOR
  if (user.role === "AUTHOR" || user.role === "ADMIN") {
    throw new AppError(
      "ROLE_CHANGE_NOT_ALLOWED",
      `User is already a ${user.role}.`
    );
  }

  const updatedUser = await userRepo.updateUserRole(userId, "AUTHOR");
  return updatedUser;
}

/**
 * Updates the profile of the currently logged-in user.
 * @param {string} currentUserId - The ID of the user making the request.
 * @param {object} profileData - The data to update (e.g., name).
 */
export async function updateUserProfile(currentUserId, profileData) {
  const updatedUser = await userRepo.updateUserById(currentUserId, profileData);
  if (!updatedUser) {
    throw new AppError("USER_NOT_FOUND", "Could not update profile.");
  }
  return updatedUser;
}

/**
 * Updates a user's details. (Admin only)
 * @param {string} userIdToUpdate - The ID of the user to update.
 * @param {object} updateData - The data to update (e.g., name, role).
 */
export async function updateUserByAdmin(userIdToUpdate, updateData) {
  const updatedUser = await userRepo.updateUserById(userIdToUpdate, updateData);
  if (!updatedUser) {
    throw new AppError(
      "USER_NOT_FOUND",
      "No user found with that ID to update."
    );
  }
  return updatedUser;
}

/**
 * Deletes a user. (Admin only)
 * @param {string} userIdToDelete - The ID of the user to delete.
 */
export async function deleteUser(userIdToDelete) {
  const deletedUser = await userRepo.deleteUserById(userIdToDelete);
  if (!deletedUser) {
    throw new AppError(
      "USER_NOT_FOUND",
      "No user found with that ID to delete."
    );
  }
  return { message: "User deleted successfully." };
}

/**
 * Gathers statistics for an author's dashboard.
 * @param {string} authorId - The ID of the author.
 */
export async function getAuthorStats(authorId) {
  const authorObjectId = new mongoose.Types.ObjectId(authorId);

  // Get book statistics
  const [bookStats, publishedCount, draftCount] = await Promise.all([
    BookModel.aggregate([
      { $match: { author: authorObjectId } },
      {
        $group: {
          _id: null,
          totalBooks: { $sum: 1 },
          totalViews: { $sum: "$viewCount" },
          totalLikes: { $sum: "$likes" },
        },
      },
    ]),
    BookModel.countDocuments({ author: authorObjectId, status: "published" }),
    BookModel.countDocuments({ author: authorObjectId, status: "draft" }),
  ]);

  // Get total chapters count for this author's books
  const authorBooks = await BookModel.find({ author: authorObjectId }).select('_id');
  const bookIds = authorBooks.map(book => book._id);

  const ChapterModel = (await import("../models/chapterModel.js")).default;
  const totalChapters = await ChapterModel.countDocuments({ book: { $in: bookIds } });

  const baseStats = bookStats[0] || { totalBooks: 0, totalViews: 0, totalLikes: 0 };

  return {
    stats: {
      totalBooks: baseStats.totalBooks,
      publishedBooks: publishedCount,
      draftBooks: draftCount,
      totalLikes: baseStats.totalLikes,
      totalViews: baseStats.totalViews,
      totalChapters: totalChapters,
    }
  };
}

/**
 * Retrieves the liked books for a user with full book details and pagination.
 * @param {string} userId - The ID of the user.
 * @param {object} options - Pagination options.
 * @param {number} options.page - The current page (default: 1).
 * @param {number} options.limit - The number of items per page (default: 10, max: 100).
 */
export async function getLikedBooks(userId, options = {}) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new AppError("USER_NOT_FOUND", "No user found with that ID.");
  }

  // Get pagination parameters
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));
  const skip = (page - 1) * limit;

  // Count total liked books
  const totalLikedBooks = user.likedBooks ? user.likedBooks.length : 0;

  // Get paginated liked books
  const ChapterModel = (await import("../models/chapterModel.js")).default;
  const likedBooks = await BookModel.find({
    _id: { $in: user.likedBooks },
    status: "published"
  })
    .populate("author", "name avatar")
    .select("title author genre tags rating image isPremium likes viewCount publishedDate")
    .skip(skip)
    .limit(limit)
    .lean();

  // Add totalChapters to each book
  const booksWithChapters = await Promise.all(
    likedBooks.map(async (book) => {
      const totalChapters = await ChapterModel.countDocuments({ book: book._id });
      return { ...book, totalChapters };
    })
  );

  const totalPages = Math.ceil(totalLikedBooks / limit);

  return {
    likedBooks: booksWithChapters,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalBooks: totalLikedBooks,
      hasMore: page < totalPages
    }
  };
}
