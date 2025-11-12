import * as userService from "../services/userService.js";
import * as bookService from "../services/bookService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";
import { AppError } from "../utils/errorHandler.js";

export async function updateProfileImage(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError("FILE_NOT_PROVIDED", "No image file provided.");
    }
    const updatedUser = await userService.updateUserProfileImage(
      req.user.id,
      req.file
    );
    sendSuccessResponse(res, updatedUser, "Profile image updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    sendSuccessResponse(res, users, "All users retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccessResponse(res, user, "User retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentUserProfile(req, res, next) {
  try {
    const updatedUser = await userService.updateUserProfile(
      req.user.id,
      req.body
    );
    sendSuccessResponse(res, updatedUser, "Your profile has been updated.");
  } catch (error) {
    next(error);
  }
}

export async function updateUserByAdmin(req, res, next) {
  try {
    const updatedUser = await userService.updateUserByAdmin(
      req.params.id,
      req.body
    );
    sendSuccessResponse(res, updatedUser, "User updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function becomeAuthor(req, res, next) {
  try {
    // The user's ID is taken securely from the authenticated session (req.user)
    const updatedUser = await userService.upgradeToAuthor(req.user.id);
    sendSuccessResponse(
      res,
      updatedUser,
      "Congratulations! You are now a Author."
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const result = await userService.deleteUser(req.params.id);
    sendSuccessResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

export async function getMyBooks(req, res, next) {
  try {
    const books = await bookService.getBooksByAuthor(req.user.id);
    sendSuccessResponse(res, books, "Your books retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getAuthorStats(req, res, next) {
  try {
    const stats = await userService.getAuthorStats(req.user.id);
    sendSuccessResponse(res, stats, "Author stats retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getLikedBooks(req, res, next) {
  try {
    const books = await userService.getLikedBooks(req.user.id);
    sendSuccessResponse(res, books, "Liked books retrieved successfully.");
  } catch (error) {
    next(error);
  }
}
