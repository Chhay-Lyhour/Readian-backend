import { cloudinary, checkCloudinaryConfiguration } from "../config/cloudinary.js";
import { AppError } from "../utils/errorHandler.js";
import { saveFileLocally } from "./localUploadService.js";

/**
 * Checks if Cloudinary is configured.
 * @returns {boolean} - True if Cloudinary is configured, false otherwise.
 */
const isCloudinaryConfigured = () => {
  try {
    checkCloudinaryConfiguration();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Uploads a file from a buffer to Cloudinary or local storage.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} folderName - The name of the folder to store the file.
 * @param {string} originalName - The original filename (for local storage).
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded file.
 */
export const uploadFromBuffer = async (fileBuffer, folderName, originalName = "file.jpg") => {
  // Try Cloudinary first if configured
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload failed, falling back to local storage:", error.message);
            // Fallback to local storage if Cloudinary fails
            saveFileLocally(fileBuffer, folderName, originalName)
              .then(resolve)
              .catch(reject);
          } else if (result) {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Use local storage if Cloudinary is not configured
    console.log("Cloudinary not configured, using local file storage");
    return saveFileLocally(fileBuffer, folderName, originalName);
  }
};
