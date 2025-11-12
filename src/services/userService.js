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
  // Upload the new avatar to Cloudinary
  const imageUrl = await uploadFromBuffer(file.buffer, "profile_images");

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
  const stats = await BookModel.aggregate([
    { $match: { author: authorObjectId } },
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        totalViews: { $sum: "$viewCount" },
        totalLikes: { $sum: "$likes" },
      },
    },
    {
      $project: {
        _id: 0,
        totalBooks: 1,
        totalViews: 1,
        totalLikes: 1,
      },
    },
  ]);

  return stats[0] || { totalBooks: 0, totalViews: 0, totalLikes: 0 };
}

/**
 * Retrieves the liked books for a user.
 * @param {string} userId - The ID of the user.
 */
export async function getLikedBooks(userId) {
  const user = await userRepo.findUserById(userId).populate("likedBooks");
  if (!user) {
    throw new AppError("USER_NOT_FOUND", "No user found with that ID.");
  }
  return user.likedBooks;
}
