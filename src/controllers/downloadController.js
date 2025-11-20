import BookModel from "../models/bookModel.js";
import DownloadModel from "../models/downloadModel.js";
import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";
import { generateWatermarkedPDF } from "../services/pdfService.js";
import { sendSuccessResponse } from "../utils/responseHandler.js";

/**
 * Download a book as PDF (Premium subscribers only)
 * @route GET /api/books/:bookId/download
 */
export const downloadBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    // Fetch the book
    const book = await BookModel.findById(bookId).populate("author", "name email");

    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", "Book not found", 404);
    }

    // Check if book is published (authors can download their own drafts)
    if (book.status !== "published" && book.author._id.toString() !== userId) {
      throw new AppError(
        "BOOK_NOT_AVAILABLE",
        "This book is not available for download",
        403
      );
    }

    // Check if download is allowed for this book
    if (!book.allowDownload && book.author._id.toString() !== userId) {
      throw new AppError(
        "DOWNLOAD_DISABLED",
        "Downloads have been disabled for this book",
        403
      );
    }

    // Get user details
    const user = await User.findById(userId).select("email name plan");

    // Authors can always download their own books, skip other checks
    const isAuthor = book.author._id.toString() === userId;

    // Check download limits (10 downloads per day for premium users), but not for authors downloading their own books
    if (!isAuthor) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const downloadCountToday = await DownloadModel.countDocuments({
        user: userId,
        downloadDate: { $gte: today },
      });

      if (downloadCountToday >= 10) {
        throw new AppError(
          "DOWNLOAD_LIMIT_REACHED",
          "You have reached your daily download limit of 10 books. Please try again tomorrow.",
          429
        );
      }
    }

    // Generate clean PDF (no watermark, no footer)
    const { stream, filename } = await generateWatermarkedPDF(
      bookId,
      user.email
    );

    // Log the download
    await DownloadModel.create({
      user: userId,
      book: bookId,
      downloadDate: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    // Increment book download count
    await BookModel.findByIdAndUpdate(bookId, {
      $inc: { downloadCount: 1 },
    });

    // Set response headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe the PDF to response
    stream.pipe(res);

    // Handle stream errors
    stream.on("error", (error) => {
      console.error("PDF generation error:", error);
      if (!res.headersSent) {
        next(
          new AppError(
            "PDF_GENERATION_ERROR",
            "Failed to generate PDF. Please try again later.",
            500
          )
        );
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get download history for current user
 * @route GET /api/downloads/history
 */
export const getDownloadHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const downloads = await DownloadModel.find({ user: userId })
      .populate("book", "title author image genre")
      .sort({ downloadDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalDownloads = await DownloadModel.countDocuments({ user: userId });

    sendSuccessResponse(
      res,
      {
        downloads,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalDownloads / limit),
          totalDownloads,
          limit,
        },
      },
      "Download history retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get download statistics for current user
 * @route GET /api/downloads/stats
 */
export const getDownloadStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total downloads
    const totalDownloads = await DownloadModel.countDocuments({ user: userId });

    // Downloads today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const downloadsToday = await DownloadModel.countDocuments({
      user: userId,
      downloadDate: { $gte: today },
    });

    // Downloads this month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const downloadsThisMonth = await DownloadModel.countDocuments({
      user: userId,
      downloadDate: { $gte: firstDayOfMonth },
    });

    // Remaining downloads today
    const remainingToday = Math.max(0, 10 - downloadsToday);

    sendSuccessResponse(
      res,
      {
        totalDownloads,
        downloadsToday,
        downloadsThisMonth,
        remainingToday,
        dailyLimit: 10,
      },
      "Download statistics retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get download analytics for author (their books)
 * @route GET /api/author/downloads/analytics
 */
export const getAuthorDownloadAnalytics = async (req, res, next) => {
  try {
    const authorId = req.user.id;

    // Get all books by this author
    const authorBooks = await BookModel.find({ author: authorId }).select("_id");
    const bookIds = authorBooks.map((book) => book._id);

    // Total downloads for all author's books
    const totalDownloads = await DownloadModel.countDocuments({
      book: { $in: bookIds },
    });

    // Downloads per book
    const downloadsPerBook = await DownloadModel.aggregate([
      { $match: { book: { $in: bookIds } } },
      {
        $group: {
          _id: "$book",
          downloadCount: { $count: {} },
        },
      },
      { $sort: { downloadCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $project: {
          bookId: "$_id",
          bookTitle: "$bookDetails.title",
          downloadCount: 1,
        },
      },
    ]);

    // Downloads this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const downloadsThisMonth = await DownloadModel.countDocuments({
      book: { $in: bookIds },
      downloadDate: { $gte: firstDayOfMonth },
    });

    sendSuccessResponse(
      res,
      {
        totalDownloads,
        downloadsThisMonth,
        topDownloadedBooks: downloadsPerBook,
      },
      "Author download analytics retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

