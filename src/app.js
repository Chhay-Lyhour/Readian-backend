import express from "express";
import dotenv from "dotenv";
import bookRouter from "./routes/bookRoute.js";
import authRouter from "./routes/authRoute.js";
import { userRouter } from "./routes/userRoute.js";
import subscriptionRouter from "./routes/subscriptionRoute.js";
import adminRouter from "./routes/adminRoute.js";
import analyticsRouter from "./routes/analyticsRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import chapterRouter from "./routes/chapterRoute.js";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
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

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/books", bookRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/admin", adminRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/payments", paymentRouter);
app.use("/api", chapterRouter);

app.get("/", (req, res) => {
  res.send("Hello from Node API server updated");
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
