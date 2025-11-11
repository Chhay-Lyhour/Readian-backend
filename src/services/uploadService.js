import { cloudinary, checkCloudinaryConfiguration } from "../config/cloudinary.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Uploads a file from a buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} folderName - The name of the folder in Cloudinary to store the file.
 * @returns {Promise<string>} - A promise that resolves to the secure URL of the uploaded file.
 */
export const uploadFromBuffer = (fileBuffer, folderName) => {
  // First, check if Cloudinary is configured.
  checkCloudinaryConfiguration();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(new AppError("CLOUDINARY_UPLOAD_FAILED", error.message));
        }
        if (result) {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};
