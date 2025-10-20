import express, { response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bookRoute from "./routes/book.route.js";
import userRoute from "./routes/user.route.js";
import { clerkClient } from "@clerk/express";

const app = express();

// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/api/books", bookRoute);
app.use("/api/users", userRoute);

dotenv.config();
const port = process.env.PORT || 3000;

app.post("/", async (req, res) => {});

// database

const mongoUrl =
  "mongodb+srv://chhaylyhour425_db_user:kovF91UvlkdtB8eS@readiandb.xsnzrha.mongodb.net/Node-API?retryWrites=true&w=majority&appName=readiandb";
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
