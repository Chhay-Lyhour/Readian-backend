import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Book from "./models/book.model.js";
import bookRoute from "./routes/book.route.js";

// middleware

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

dotenv.config();
const port = process.env.PORT || 3000;
const mongoUrl =
  "mongodb+srv://chhaylyhour425_db_user:kovF91UvlkdtB8eS@readiandb.xsnzrha.mongodb.net/Node-API?retryWrites=true&w=majority&appName=readiandb";

// database

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

//routes

app.use("/api/books", bookRoute);

app.get("/", (req, res) => {
  res.send("Hello from Node API server updated");
});

// get all books

app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find({});
    res.status(200).json(books);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
});

// get a book

app.get("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    res.status(200).json(book);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
});

app.post("/api/books", async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// update a book

app.put("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(id, req.body);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    const updatedBook = await Book.findById(id);
    return res.status(200).json(updatedBook);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// delete a product

app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: "Book deleted unsuccessfully" });
    }
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
