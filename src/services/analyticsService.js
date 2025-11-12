import BookModel from "../models/bookModel.js";

/**
 * Gathers public analytics, such as top books and authors.
 */
export async function getPublicAnalytics() {
  const [topBooks, topAuthors] = await Promise.all([
    // Aggregation for top 5 most viewed books
    BookModel.find({ status: "published" })
      .sort({ viewCount: -1 })
      .limit(5)
      .select("title viewCount author"),

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
  ]);

  return { topBooks, topAuthors };
}
