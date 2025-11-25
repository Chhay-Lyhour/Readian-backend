import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bookRouter from "./routes/bookRoute.js";
import authRouter from "./routes/authRoute.js";
import { userRouter } from "./routes/userRoute.js";
import subscriptionRouter from "./routes/subscriptionRoute.js";
import adminRouter from "./routes/adminRoute.js";
import analyticsRouter from "./routes/analyticsRoute.js";
import downloadRouter from "./routes/downloadRoute.js";
import ratingRouter from "./routes/ratingRoute.js";
import cors from "cors";
import helmet from "helmet";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandlingMiddleware.js";
import { config } from "./config/config.js";
import { configureCloudinary } from "./config/cloudinary.js";

dotenv.config();
const app = express();

// Configure Cloudinary
configureCloudinary();

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false, // Disable for API
  contentSecurityPolicy: false, // Disable for API flexibility
}));

app.use(cors({
  origin: config.corsOrigin || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight requests for 10 minutes
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup static file serving
import("./config/staticFiles.js")
  .then(({ setupStaticFileServing }) => {
    setupStaticFileServing(app);
  })
  .catch((err) => {
    console.warn("Could not setup static file serving:", err.message);
  });

// Import Routes
import healthRouter from "./routes/healthRoute.js";

// Routes
app.use("/api", healthRouter); // Health check endpoints
app.use("/api/books", bookRouter);
app.use("/api/books", ratingRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/admin", adminRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api", downloadRouter);

app.get("/", (req, res) => {
  res.send("Hello from Node API server updated");
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// For Vercel serverless deployment
if (process.env.VERCEL === '1') {
  // Ensure DB connection for serverless
  import('./config/db.js').then(({ connectDB }) => {
    connectDB().catch(err => console.error('DB connection error:', err));
  });
}

export default app;
