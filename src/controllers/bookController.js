import BookModel from "../models/bookModel.js";

const getBooks = async (req, res) => {
  try {
    const books = await BookModel.find({});
    res.status(200).json(books);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const getBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookModel.findById(id);
    res.status(200).json(book);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

const createBook = async (req, res) => {
  try {
    const book = await BookModel.create(req.body);
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookModel.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: "Book deleted unsuccessfully" });
    }
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getBooks, getBook, createBook, updateBook, deleteBook };
