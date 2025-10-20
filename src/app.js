// File: src/app.ts
import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "./config/config";
import { errorLogger, requestLogger } from "./utils/logger";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware"; // Create this file
import { authRouter } from "./routes/auth.route";

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// --- Routes ---
app.use("/api/auth", authRouter);

app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
