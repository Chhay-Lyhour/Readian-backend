import * as userService from "../services/userService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

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

export async function deleteUser(req, res, next) {
  try {
    const result = await userService.deleteUser(req.params.id);
    sendSuccessResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
}
