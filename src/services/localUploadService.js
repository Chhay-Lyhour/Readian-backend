import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AppError } from "../utils/errorHandler.js";

// Use process.cwd() which works in both test and production
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different types
const bookCoversDir = path.join(uploadsDir, "book_covers");
const profileImagesDir = path.join(uploadsDir, "profile_images");

[bookCoversDir, profileImagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Saves a file from buffer to local storage.
 * @param {Buffer} fileBuffer - The buffer of the file to save.
 * @param {string} folderName - The name of the folder to store the file ('book_covers' or 'profile_images').
 * @param {string} originalName - The original filename.
 * @returns {Promise<string>} - A promise that resolves to the file path.
 */
export const saveFileLocally = async (fileBuffer, folderName, originalName = "file") => {
  try {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(originalName) || ".jpg";
    const filename = `${Date.now()}-${uniqueSuffix}${ext}`;

    // Determine directory
    let targetDir;
    if (folderName === "book_covers") {
      targetDir = bookCoversDir;
    } else if (folderName === "profile_images") {
      targetDir = profileImagesDir;
    } else {
      targetDir = path.join(uploadsDir, folderName);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    }

    const filepath = path.join(targetDir, filename);

    // Write file to disk
    await fs.promises.writeFile(filepath, fileBuffer);

    // Return the relative URL path (for serving via Express static middleware)
    return `/uploads/${folderName}/${filename}`;
  } catch (error) {
    throw new AppError("FILE_SAVE_FAILED", `Failed to save file: ${error.message}`);
  }
};

/**
 * Deletes a file from local storage.
 * @param {string} fileUrl - The URL/path of the file to delete.
 */
export const deleteFileLocally = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
      return; // Not a local file or invalid path
    }

    const filepath = path.join(__dirname, "../..", fileUrl);

    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    // Don't throw error - file deletion failure shouldn't break the app
  }
};

