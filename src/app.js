import express from "express";
import dotenv from "dotenv";
import publicBookRouter from "./routes/public/bookRoute.js";
import userBookRouter from "./routes/user/bookRoute.js";
import authorBookRouter from "./routes/author/bookRoute.js";
import authRouter from "./routes/public/authRoute.js";
import { userRouter } from "./routes/user/userRoute.js";
import subscriptionRouter from "./routes/user/subscriptionRoute.js";
import adminRouter from "./routes/admin/adminRoute.js";
import analyticsRouter from "./routes/public/analyticsRoute.js";
import paymentRouter from "./routes/user/paymentRoute.js";
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
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/books", publicBookRouter);
app.use("/api/books", userBookRouter);
app.use("/api/books", authorBookRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/admin", adminRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/payments", paymentRouter);

app.get("/", (req, res) => {
  res.send("Hello from Node API server updated");
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
