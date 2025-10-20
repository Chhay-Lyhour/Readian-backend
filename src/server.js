import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bookRoute from "./routes/book.route.js";
const app = express();

// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes

app.use("/api/books", bookRoute);

dotenv.config();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello from Node API server updated");
});

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

// USER
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  password: String,
});
const UserModel = mongoose.model("User", userSchema);
app.get("/getUsers", async (req, res) => {
  const userData = await UserModel.find();
  res.json(userData);
});
