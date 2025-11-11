import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../utils/errorHandler.js";

const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn(
      "Cloudinary environment variables not found. Upload functionality will be disabled."
    );
    // We don't throw an error here to allow the app to run without upload functionality.
    // The error will be thrown at the point of upload.
    return;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log("Cloudinary configured successfully.");
};

const checkCloudinaryConfiguration = () => {
  if (!cloudinary.config().cloud_name) {
    throw new AppError(
      "CLOUDINARY_NOT_CONFIGURED",
      "Cloudinary is not configured. Please provide the necessary environment variables."
    );
  }
};

export { cloudinary, configureCloudinary, checkCloudinaryConfiguration };
