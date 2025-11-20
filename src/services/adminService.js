import { User } from "../models/userModel.js";
import BookModel from "../models/bookModel.js";
import ChapterModel from "../models/chapterModel.js";
import { getPublicAnalytics } from "./analyticsService.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Admin can delete any book (bypasses author check).
 * Also deletes all associated chapters and removes the book from all users' liked books.
 * @param {string} bookId - The ID of the book to delete.
 */
export async function deleteBookByAdmin(bookId) {
  const book = await BookModel.findById(bookId);
  if (!book) {
    throw new AppError("BOOK_NOT_FOUND");
  }

  // Delete all chapters associated with this book
  await ChapterModel.deleteMany({ book: bookId });

  // Remove this book from all users' likedBooks arrays
  await User.updateMany(
    { likedBooks: bookId },
    { $pull: { likedBooks: bookId } }
  );

  // Delete the book itself
  await BookModel.findByIdAndDelete(bookId);

  return { message: "Book and all associated data deleted successfully by admin." };
}

/**
 * Gathers various analytics for the admin dashboard.
 */
export async function getDashboardAnalytics() {
  // Define the date for the last 30 days
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  // Get first and last day of current month for revenue calculation
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Perform all aggregations in parallel for efficiency
  const [
    totalUsers,
    userRoles,
    totalBooks,
    bookStatus,
    premiumBooks,
    totalViews,
    newUsersByDay,
    publicAnalytics,
    totalLikes,
    totalChapters,
    // Get active subscribers by plan
    basicSubscribers,
    premiumSubscribers,
    freeUsers,
    // Get subscribers who subscribed this month for revenue calculation
    basicSubscribersThisMonth,
    premiumSubscribersThisMonth,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    BookModel.countDocuments(),
    BookModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    BookModel.countDocuments({ isPremium: true }),
    BookModel.aggregate([
      { $group: { _id: null, total: { $sum: "$viewCount" } } },
    ]),
    // Aggregation for new users in the last 30 days
    User.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    getPublicAnalytics(),
    // Aggregation for total likes
    BookModel.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]),
    // Get total chapters count
    (async () => {
      const ChapterModel = (await import("../models/chapterModel.js")).default;
      return ChapterModel.countDocuments();
    })(),
    // Count active basic subscribers
    User.countDocuments({
      plan: "basic",
      subscriptionStatus: "active",
      subscriptionExpiresAt: { $gte: now }
    }),
    // Count active premium subscribers
    User.countDocuments({
      plan: "premium",
      subscriptionStatus: "active",
      subscriptionExpiresAt: { $gte: now }
    }),
    // Count free users (no active subscription)
    User.countDocuments({
      $or: [
        { plan: "free" },
        { subscriptionStatus: "inactive" },
        { subscriptionExpiresAt: { $lt: now } },
        { subscriptionExpiresAt: null }
      ]
    }),
    // Count basic subscribers who subscribed this month
    User.countDocuments({
      plan: "basic",
      subscriptionStatus: "active",
      subscriptionExpiresAt: { $gte: now },
      updatedAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    }),
    // Count premium subscribers who subscribed this month
    User.countDocuments({
      plan: "premium",
      subscriptionStatus: "active",
      subscriptionExpiresAt: { $gte: now },
      updatedAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    }),
  ]);

  // Calculate revenue this month (Basic = $5, Premium = $10)
  const revenueThisMonth = (basicSubscribersThisMonth * 5) + (premiumSubscribersThisMonth * 10);

  // Get book status counts
  const publishedBooks = bookStatus.find(s => s._id === "published")?.count || 0;
  const draftBooks = bookStatus.find(s => s._id === "draft")?.count || 0;

  // Format the results into a clean object
  const analytics = {
    // Simple flat structure for easy consumption (matches documentation)
    totalUsers,
    totalBooks,
    publishedBooks,
    draftBooks,
    totalChapters,
    totalLikes: totalLikes[0]?.total || 0,
    totalViews: totalViews[0]?.total || 0,
    basicSubscribers,
    premiumSubscribers,
    freeUsers,
    revenueThisMonth,

    // Detailed breakdown for advanced analytics
    users: {
      total: totalUsers,
      roles: userRoles.reduce((acc, role) => {
        acc[role._id] = role.count;
        return acc;
      }, {}),
      subscriptionBreakdown: {
        basicSubscribers,
        premiumSubscribers,
        freeUsers
      }
    },
    books: {
      total: totalBooks,
      status: {
        published: publishedBooks,
        draft: draftBooks
      },
      premium: premiumBooks,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
    },
    detailed: {
      newUsersLast30Days: newUsersByDay,
      topBooks: publicAnalytics.topBooks,
      topAuthors: publicAnalytics.topAuthors,
    },
  };

  return analytics;
}
