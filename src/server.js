import express from "express";
import dotenv from "dotenv";
import bookRouter from "./routes/bookRoute.js";
import authRouter from "./routes/authRoute.js";
import { userRouter } from "./routes/userRoute.js";
import subscriptionRouter from "./routes/subscriptionRoute.js";
import adminRouter from "./routes/adminRoute.js";
import cors from "cors";
import helmet from "helmet";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandlingMiddleware.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();
const port = config.port;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/books", bookRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("Hello from Node API server updated");
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
