import * as userService from "../services/userService.js";
import * as bookService from "../services/bookService.js";
import * as authService from "../services/authService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";
import { AppError } from "../utils/errorHandler.js";

export async function changePassword(req, res, next) {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    sendSuccessResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

export async function updateProfileImage(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError("FILE_NOT_PROVIDED", "No image file provided.");
    }
    const updatedUser = await userService.updateUserProfileImage(
      req.user.id,
      req.file
    );
    sendSuccessResponse(
      res,
      updatedUser,
      "Profile image updated successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function updateCoverImage(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError("FILE_NOT_PROVIDED", "No cover image file provided.");
    }
    const updatedUser = await userService.updateUserCoverImage(
      req.user.id,
      req.file
    );
    sendSuccessResponse(
      res,
      updatedUser,
      "Cover image updated successfully."
    );
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
    const { status, page, limit } = req.query;
    const options = {};

    // Add optional filters
    if (status) options.status = status;
    if (page) options.page = parseInt(page);
    if (limit) options.limit = parseInt(limit);

    const books = await bookService.getBooksByAuthor(req.user.id, options);
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
    const { page, limit } = req.query;
    const result = await userService.getLikedBooks(req.user.id, { page, limit });
    sendSuccessResponse(res, result, "Liked books retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getAuthorProfile(req, res, next) {
  try {
    const { page, limit } = req.query;
    const authorProfile = await userService.getAuthorProfile(req.params.authorId, { page, limit });
    sendSuccessResponse(res, authorProfile, "Author profile retrieved successfully.");
  } catch (error) {
    next(error);
  }
}
