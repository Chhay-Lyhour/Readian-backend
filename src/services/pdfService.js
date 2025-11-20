import PDFDocument from "pdfkit";
import BookModel from "../models/bookModel.js";
import ChapterModel from "../models/chapterModel.js";
import { User } from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Generate a PDF for a book with all its chapters
 * @param {string} bookId - The ID of the book to generate PDF for
 * @returns {Promise<{stream: PDFDocument, filename: string}>}
 */
export const generateBookPDF = async (bookId) => {
  // Fetch book with author details
  const book = await BookModel.findById(bookId).populate("author", "name");

  if (!book) {
    throw new AppError("BOOK_NOT_FOUND", "Book not found", 404);
  }

  // Fetch all chapters for this book, sorted by chapter number
  const chapters = await ChapterModel.find({ book: bookId }).sort({
    chapterNumber: 1,
  });

  if (!chapters || chapters.length === 0) {
    throw new AppError(
      "NO_CHAPTERS",
      "This book has no chapters available for download",
      400
    );
  }

  // Create PDF document with optimized settings for better page utilization
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: 50,
      bottom: 60,
      left: 50,
      right: 50,
    },
    bufferPages: true,
    autoFirstPage: false,
    info: {
      Title: book.title,
      Author: book.author?.name || "Unknown Author",
      Subject: book.description || "",
      Keywords: book.tags || "",
      Creator: "Readian Platform",
    },
  });

  // Add title page
  doc.addPage();
  addTitlePage(doc, book);

  // Add table of contents
  doc.addPage();
  addTableOfContents(doc, chapters);

  // Add chapters
  chapters.forEach((chapter, index) => {
    doc.addPage();
    addChapter(doc, chapter);
  });

  // Add page numbers to all pages using buffering
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    const pageNumber = i + 1;
    addPageNumber(doc, pageNumber, book.title);
  }

  // Finalize PDF
  doc.end();

  // Generate filename
  const filename = `${sanitizeFilename(book.title)}.pdf`;

  return {
    stream: doc,
    filename: filename,
  };
};

/**
 * Add title page to PDF with improved formatting
 */
function addTitlePage(doc, book) {
  // Center vertically on page
  const pageHeight = doc.page.height;
  const startY = pageHeight * 0.20;

  doc.y = startY;

  // Main title with larger font
  doc
    .fontSize(36)
    .font("Helvetica-Bold")
    .text(book.title.toUpperCase(), {
      align: "center",
      width: doc.page.width - 100,
    })
    .moveDown(0.8);

  // Author name
  doc
    .fontSize(22)
    .font("Helvetica")
    .text(`by ${book.author?.name || "Unknown Author"}`, {
      align: "center",
    })
    .moveDown(3);

  // Decorative line
  const lineY = doc.y;
  doc
    .strokeColor("#333333")
    .lineWidth(2)
    .moveTo(doc.page.margins.left + 80, lineY)
    .lineTo(doc.page.width - doc.page.margins.right - 80, lineY)
    .stroke();

  doc.moveDown(2);

  // Book metadata in a clean layout
  if (book.description) {
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(book.description, {
        align: "center",
        width: doc.page.width - 140,
      })
      .moveDown(1.5);
  }

  // Create metadata section
  const leftX = doc.page.margins.left + 60;
  const contentWidth = doc.page.width - 2 * (doc.page.margins.left + 60);

  if (book.genre) {
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Genre: ", leftX, doc.y, { continued: true, width: contentWidth })
      .font("Helvetica")
      .text(book.genre)
      .moveDown(0.4);
  }

  if (book.tags && book.tags.length > 0) {
    const tagsText = Array.isArray(book.tags) ? book.tags.join(", ") : book.tags;
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Tags: ", leftX, doc.y, { continued: true, width: contentWidth })
      .font("Helvetica")
      .text(tagsText)
      .moveDown(0.4);
  }

  if (book.readingTime) {
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Reading Time: ", leftX, doc.y, { continued: true, width: contentWidth })
      .font("Helvetica")
      .text(book.readingTime)
      .moveDown(0.4);
  }

  if (book.averageRating && book.totalRatings) {
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Rating: ", leftX, doc.y, { continued: true, width: contentWidth })
      .font("Helvetica")
      .text(`${book.averageRating.toFixed(1)}/5 (${book.totalRatings} ratings)`)
      .moveDown(0.4);
  }

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Status: ", leftX, doc.y, { continued: true, width: contentWidth })
    .font("Helvetica")
    .text(book.bookStatus === "finished" ? "Completed" : "Ongoing")
    .moveDown(2);

  // Add download info at bottom
  doc.y = doc.page.height - 80;
  doc
    .fontSize(9)
    .font("Helvetica-Oblique")
    .fillColor("#666666")
    .text(`Downloaded from Readian Platform`, { align: "center" })
    .moveDown(0.2)
    .text(`${new Date().toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, { align: "center" })
    .fillColor("#000000");
}

/**
 * Add table of contents with improved formatting
 */
function addTableOfContents(doc, chapters) {
  doc
    .fontSize(26)
    .font("Helvetica-Bold")
    .text("TABLE OF CONTENTS", {
      align: "center",
    })
    .moveDown(2.5);

  doc.fontSize(12).font("Helvetica");

  chapters.forEach((chapter, index) => {
    const leftMargin = doc.page.margins.left + 20;
    const contentWidth = doc.page.width - 2 * doc.page.margins.left - 40;

    doc
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .text(`Chapter ${chapter.chapterNumber}`, leftMargin, doc.y, {
        continued: true,
        width: contentWidth,
      })
      .font("Helvetica")
      .fillColor("#333333")
      .text(`: ${chapter.title}`, {
        continued: false,
      })
      .fillColor("#000000")
      .moveDown(0.6);

    // Add a subtle separator line after every 6 chapters for readability
    if ((index + 1) % 6 === 0 && index < chapters.length - 1) {
      doc.moveDown(0.3);
      const lineY = doc.y;
      doc
        .strokeColor("#e0e0e0")
        .lineWidth(0.5)
        .moveTo(leftMargin, lineY)
        .lineTo(leftMargin + contentWidth, lineY)
        .stroke()
        .strokeColor("#000000");
      doc.moveDown(0.3);
    }
  });
}

/**
 * Add a chapter to the PDF with improved formatting
 */
function addChapter(doc, chapter) {
  const contentWidth = doc.page.width - 2 * doc.page.margins.left;

  // Chapter number and title
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text(`CHAPTER ${chapter.chapterNumber}`, {
      align: "left",
    })
    .moveDown(0.2);

  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .fillColor("#333333")
    .text(chapter.title, {
      align: "left",
      width: contentWidth,
    })
    .moveDown(0.4);

  // Decorative line under title
  const lineY = doc.y;
  doc
    .strokeColor("#999999")
    .lineWidth(1.5)
    .moveTo(doc.page.margins.left, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .stroke()
    .strokeColor("#000000");

  doc.moveDown(1.2);

  // Chapter content with proper formatting and better line spacing
  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#000000")
    .text(chapter.content, {
      align: "justify",
      lineGap: 4,
      paragraphGap: 8,
      indent: 0,
      width: contentWidth,
    });
}

/**
 * Add page number to the current page
 */
function addPageNumber(doc, pageNumber, bookTitle) {
  // Save the current Y position
  const oldY = doc.y;

  // Save the graphics state
  doc.save();

  // Add page number at bottom center using direct positioning
  const pageNumberY = doc.page.height - 50;
  const pageNumberX = doc.page.width / 2;

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#666666")
    .text(
      String(pageNumber),
      pageNumberX - 20,
      pageNumberY,
      {
        width: 40,
        align: "center",
        lineBreak: false,
      }
    );

  // Restore graphics state
  doc.restore();

  // Restore Y position
  doc.y = oldY;
}

/**
 * Add watermark to current page
 */
function addWatermark(doc, userEmail) {
  // Save current position
  const currentY = doc.y;

  // Save graphics state
  doc.save();

  // Add very subtle watermark at bottom of page
  const watermarkY = doc.page.height - 25;
  const watermarkText = `Licensed to: ${userEmail}`;

  doc
    .fontSize(7)
    .font("Helvetica-Oblique")
    .fillOpacity(0.05)
    .text(
      watermarkText,
      doc.page.margins.left,
      watermarkY,
      {
        width: doc.page.width - 2 * doc.page.margins.left,
        align: "center",
        lineBreak: false,
      }
    );

  // Restore graphics state
  doc.restore();

  // Restore Y position so it doesn't affect layout
  doc.y = currentY;
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

/**
 * Generate PDF with watermark for specific user
 * @param {string} bookId - The ID of the book
 * @param {string} userEmail - The user's email for watermarking
 * @returns {Promise<{stream: PDFDocument, filename: string}>}
 */
export const generateWatermarkedPDF = async (bookId, userEmail) => {
  // Fetch book with author details
  const book = await BookModel.findById(bookId).populate("author", "name");

  if (!book) {
    throw new AppError("BOOK_NOT_FOUND", "Book not found", 404);
  }

  // Fetch all chapters for this book, sorted by chapter number
  const chapters = await ChapterModel.find({ book: bookId }).sort({
    chapterNumber: 1,
  });

  if (!chapters || chapters.length === 0) {
    throw new AppError(
      "NO_CHAPTERS",
      "This book has no chapters available for download",
      400
    );
  }

  // Create PDF document with optimized settings
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: 50,
      bottom: 60,
      left: 50,
      right: 50,
    },
    bufferPages: true,
    autoFirstPage: false,
    info: {
      Title: book.title,
      Author: book.author?.name || "Unknown Author",
      Subject: book.description || "",
      Keywords: book.tags || "",
      Creator: "Readian Platform",
    },
  });

  // Add title page
  doc.addPage();
  addTitlePage(doc, book);

  // Add table of contents
  doc.addPage();
  addTableOfContents(doc, chapters);

  // Add chapters
  chapters.forEach((chapter) => {
    doc.addPage();
    addChapter(doc, chapter);
  });

  // Add page numbers and watermarks to all pages using buffering
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    const pageNumber = i + 1;
    addPageNumber(doc, pageNumber, book.title);
    addWatermark(doc, userEmail);
  }

  // Finalize PDF
  doc.end();

  // Generate filename
  const filename = `${sanitizeFilename(book.title)}.pdf`;

  return {
    stream: doc,
    filename: filename,
  };
};

