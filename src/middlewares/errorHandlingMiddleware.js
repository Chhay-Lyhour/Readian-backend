import { AppError } from "../utils/errorHandler.js";
import { sendErrorResponse } from "../utils/responseHandler.js";

const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes

  if (err instanceof AppError) {
    return sendErrorResponse(res, err);
  }

  // Handle unexpected, non-custom errors
  const unexpectedError = new AppError("INTERNAL_SERVER_ERROR");
  return sendErrorResponse(res, unexpectedError);
};

const notFoundHandler = (req, res, next) => {
  const notFoundError = new AppError(
    "NOT_FOUND",
    `Route ${req.method} ${req.originalUrl} not found`
  );
  next(notFoundError);
};

export { errorHandler, notFoundHandler };
