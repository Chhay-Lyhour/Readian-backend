import express from "express";
import dotenv from "dotenv";
import bookRoute from "./routes/bookRoute.js";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/authRoute.js";
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

//routes

app.use("/api/books", bookRoute);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello from Node API server updated");
});

// Error Handlingi
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
