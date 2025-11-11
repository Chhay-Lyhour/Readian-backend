// This maps error codes to HTTP status codes and default messages.
const ERROR_MAP = {
  VALIDATION_ERROR: { statusCode: 400, message: "Invalid input provided." },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: "Invalid email or password.",
  },
  TOKEN_INVALID: {
    statusCode: 401,
    message: "Authentication token is invalid or missing.",
  },
  TOKEN_EXPIRED: {
    statusCode: 401,
    message: "Authentication token has expired.",
  },
  INSUFFICIENT_PERMISSIONS: {
    statusCode: 403,
    message: "You do not have permission.",
  },
  USER_NOT_FOUND: { statusCode: 404, message: "User not found." },
  BOOK_NOT_FOUND: { statusCode: 404, message: "Book not found." },
  BOOK_ALREADY_PUBLISHED: {
    statusCode: 409,
    message: "This book has already been published.",
  },
  NOT_FOUND: { statusCode: 404, message: "Resource not found." },
  EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    message: "An account with this email already exists.",
  },
  EMAIL_NOT_VERIFIED: {
    statusCode: 403,
    message: "Please verify your email address.",
  },
  EMAIL_ALREADY_VERIFIED: {
    statusCode: 409,
    message: "Email has already been verified.",
  },
  VERIFICATION_CODE_INVALID: {
    statusCode: 400,
    message: "The verification code is invalid or expired.",
  },
  ROLE_CHANGE_NOT_ALLOWED: {
    statusCode: 409,
    message: "Role change is not allowed.",
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: "An unexpected error occurred.",
  },
  EMAIL_SERVICE_ERROR: { statusCode: 500, message: "Failed to send email." },
};

class AppError extends Error {
  constructor(code, message, statusCode) {
    super(message || ERROR_MAP[code].message);
    this.code = code;
    this.statusCode = statusCode || ERROR_MAP[code].statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError, ERROR_MAP };
