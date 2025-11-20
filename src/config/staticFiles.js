import path from "path";
import express from "express";

/**
 * Setup static file serving for uploads
 * @param {express.Application} app - Express app instance
 */
export function setupStaticFileServing(app) {
  const uploadsPath = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsPath));
}

