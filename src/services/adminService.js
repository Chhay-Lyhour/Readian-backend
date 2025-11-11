import { User } from "../models/userModel.js";
import BookModel from "../models/bookModel.js";

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
    topBooks,
    topAuthors,
    userSubscriptionBreakdown,
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
    // Aggregation for top 5 most viewed books
    BookModel.find({ status: "published" })
      .sort({ viewCount: -1 })
      .limit(5)
      .select("title viewCount"),
    // Aggregation for top 5 authors
    BookModel.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$author",
          totalViews: { $sum: "$viewCount" },
          bookCount: { $sum: 1 },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      {
        $project: {
          _id: 0,
          authorId: "$_id",
          authorName: { $arrayElemAt: ["$authorDetails.name", 0] },
          totalViews: 1,
          bookCount: 1,
        },
      },
    ]),
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
    },
    detailed: {
      newUsersLast30Days: newUsersByDay,
      topBooks: topBooks,
      topAuthors: topAuthors,
    },
  };

  return analytics;
}
