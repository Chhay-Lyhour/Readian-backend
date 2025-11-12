import { User } from "../models/userModel.js";
import BookModel from "../models/bookModel.js";
import { getPublicAnalytics } from "./analyticsService.js";

/**
 * Gathers various analytics for the admin dashboard.
 */
export async function getDashboardAnalytics() {
  // Define the date for the last 30 days
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

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
    userSubscriptionBreakdown,
    totalLikes,
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
    // Aggregation for user subscription breakdown
    User.aggregate([
      {
        $group: {
          _id: {
            plan: "$plan",
            status: "$subscriptionStatus",
          },
          count: { $sum: 1 },
        },
      },
    ]),
    // Aggregation for total likes
    BookModel.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]),
  ]);

  // Format the results into a clean object
  const analytics = {
    users: {
      total: totalUsers,
      roles: userRoles.reduce((acc, role) => {
        acc[role._id] = role.count;
        return acc;
      }, {}),
      subscriptionBreakdown: userSubscriptionBreakdown.reduce((acc, item) => {
        const key =
          item._id.plan === "free" && item._id.status === "inactive"
            ? "freeNonSubscriber"
            : `${item._id.plan}PlanSubscriber`;
        acc[key] = item.count;
        return acc;
      }, {}),
    },
    books: {
      total: totalBooks,
      status: bookStatus.reduce((acc, status) => {
        acc[status._id] = status.count;
        return acc;
      }, {}),
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
