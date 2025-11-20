import BookModel from "../models/bookModel.js";
import DownloadModel from "../models/downloadModel.js";

/**
 * Gathers public analytics, such as top books and authors.
 */
export async function getPublicAnalytics() {
  const [topBooks, topAuthors] = await Promise.all([
    // Aggregation for top 5 most viewed books with comprehensive data
    BookModel.find({ status: "published" })
      .sort({ viewCount: -1 })
      .limit(5)
      .select("title viewCount likes likedBy author image genre isPremium publishedDate averageRating totalRatings downloadCount description")
      .populate("author", "name avatar email")
      .lean()
      .then(async books => {
        // Get download counts for each book
        const bookIds = books.map(book => book._id);
        const downloadCounts = await DownloadModel.aggregate([
          { $match: { book: { $in: bookIds } } },
          {
            $group: {
              _id: "$book",
              downloadCount: { $count: {} }
            }
          }
        ]);

        const downloadMap = {};
        downloadCounts.forEach(dc => {
          downloadMap[dc._id.toString()] = dc.downloadCount;
        });

        return books.map(book => ({
          _id: book._id,
          title: book.title,
          description: book.description,
          author: {
            _id: book.author._id,
            name: book.author.name,
            avatar: book.author.avatar,
          },
          image: book.image,
          genre: book.genre,
          isPremium: book.isPremium,
          publishedDate: book.publishedDate,
          viewCount: book.viewCount || 0,
          totalLikes: book.likedBy ? book.likedBy.length : 0,
          averageRating: book.averageRating ? parseFloat(book.averageRating.toFixed(1)) : 0,
          totalRatings: book.totalRatings || 0,
          downloadCount: downloadMap[book._id.toString()] || book.downloadCount || 0,
          engagement: {
            views: book.viewCount || 0,
            likes: book.likedBy ? book.likedBy.length : 0,
            ratings: book.totalRatings || 0,
            downloads: downloadMap[book._id.toString()] || book.downloadCount || 0,
          }
        }));
      }),

    // Aggregation for top 5 authors with comprehensive data including totalLikes
    BookModel.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$author",
          totalViews: { $sum: "$viewCount" },
          totalLikes: {
            $sum: {
              $cond: {
                if: { $isArray: "$likedBy" },
                then: { $size: "$likedBy" },
                else: 0
              }
            }
          },
          totalRatings: { $sum: "$totalRatings" },
          totalDownloads: { $sum: "$downloadCount" },
          averageRating: { $avg: "$averageRating" },
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
          authorEmail: { $arrayElemAt: ["$authorDetails.email", 0] },
          authorAvatar: { $arrayElemAt: ["$authorDetails.avatar", 0] },
          totalViews: 1,
          totalLikes: 1,
          totalRatings: 1,
          totalDownloads: 1,
          averageRating: { $round: ["$averageRating", 1] },
          bookCount: 1,
          engagement: {
            views: "$totalViews",
            likes: "$totalLikes",
            ratings: "$totalRatings",
            downloads: "$totalDownloads",
          }
        },
      },
    ]),
  ]);

  return { topBooks, topAuthors };
}
