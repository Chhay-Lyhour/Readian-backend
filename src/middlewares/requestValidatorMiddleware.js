import { ZodError } from "zod";
import { AppError } from "../utils/errorHandler.js";

const validateRequestBody = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate the request body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        return next(new AppError("VALIDATION_ERROR", message));
      }
      next(error);
    }
  };
};

const validateRequestQuery = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate the request query
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        return next(new AppError("VALIDATION_ERROR", message));
      }
      next(error);
    }
  };
};

export { validateRequestBody, validateRequestQuery };
