import * as userRepo from "../repositories/userRepositories.js";
import { AppError } from "../utils/errorHandler.js";

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
