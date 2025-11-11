import multer from "multer";
import { AppError } from "../utils/errorHandler.js";

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("INVALID_FILE_TYPE", "Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // 5 MB file size limit
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadSingleImage = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("FILE_TOO_LARGE", "File size cannot be larger than 5MB!"));
      }
      return next(new AppError("FILE_UPLOAD_ERROR", err.message));
    } else if (err) {
      // An unknown error occurred when uploading.
      return next(err);
    }
    // Everything went fine.
    next();
  });
};
