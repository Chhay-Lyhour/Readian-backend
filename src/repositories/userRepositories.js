import { User } from "../models/userModel.js";

/**
 * Finds all users and excludes their passwords.
 * @returns {Promise<User[]>}
 */
export async function findAllUsers() {
  // .select('-password') ensures the password hash is never returned
  return User.find().select("-password");
}

/**
 * Finds a single user by their ID, excluding the password.
 * @param {string} userId - The ID of the user to find.
 * @returns {Promise<User|null>}
 */
export async function findUserById(userId) {
  return User.findById(userId).select("-password");
}

/**
 * Updates a user's data by their ID.
 * @param {string} userId - The ID of the user to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<User|null>}
 */
export async function updateUserById(userId, updateData) {
  // { new: true } returns the updated document
  return User.findByIdAndUpdate(userId, updateData, { new: true }).select(
    "-password"
  );
}

/**
 * Updates a user's role by their ID.
 * @param {string} userId - The ID of the user to update.
 * @param {string} newRole - The new role to assign.
 * @returns {Promise<User|null>}
 */
export async function updateUserRole(userId, newRole) {
  return User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true }
  ).select("-password");
}

/**
 * Deletes a user by their ID.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<User|null>}
 */
export async function deleteUserById(userId) {
  return User.findByIdAndDelete(userId).select("-password");
}
