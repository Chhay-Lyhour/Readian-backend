import BookModel from "../models/bookModel.js";
import DownloadModel from "../models/downloadModel.js";
import { User } from "../models/userModel.js";
import SubscriptionTransactionModel from "../models/subscriptionTransactionModel.js";

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
      .populate("author", "name avatar email bio")
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
            email: book.author.email,
            bio: book.author.bio || '',
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

/**
 * Get user growth analytics for admin dashboard
 * @param {string} period - 'week', 'month', or 'year'
 * @returns {object} User growth data with daily breakdown
 */
export async function getUserGrowthAnalytics(period = 'week') {
  const now = new Date();
  let startDate;
  let dateFormat;
  let groupBy;

  // Define period ranges
  switch (period) {
    case 'week':
      // Last 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'month':
      // Last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'year':
      // Last 12 months
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m';
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  // Aggregate user registrations
  const growthData = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: now }
      }
    },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
        date: { $first: '$createdAt' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: dateFormat, date: '$date' } },
        count: 1
      }
    }
  ]);

  // Calculate cumulative growth
  let cumulative = 0;
  const dataWithCumulative = growthData.map(item => {
    cumulative += item.count;
    return {
      date: item.date,
      newUsers: item.count,
      cumulative: cumulative
    };
  });

  // Get total users for context
  const totalUsers = await User.countDocuments();
  const newUsersInPeriod = growthData.reduce((sum, item) => sum + item.count, 0);

  return {
    period,
    periodLabel: period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'Last 12 Months',
    startDate,
    endDate: now,
    data: dataWithCumulative,
    summary: {
      totalUsers,
      newUsersInPeriod,
      growthRate: totalUsers > 0 ? ((newUsersInPeriod / totalUsers) * 100).toFixed(2) : 0
    }
  };
}

/**
 * Get revenue growth analytics for admin dashboard
 * @param {string} period - 'week', 'month', or 'year'
 * @returns {object} Revenue growth data
 */
export async function getRevenueGrowthAnalytics(period = 'week') {
  const now = new Date();
  let startDate;
  let dateFormat;
  let groupBy;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m';
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const revenueData = await SubscriptionTransactionModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: now },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 },
        date: { $first: '$createdAt' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: dateFormat, date: '$date' } },
        revenue: { $round: ['$revenue', 2] },
        transactions: 1
      }
    }
  ]);

  // Calculate cumulative revenue
  let cumulative = 0;
  const dataWithCumulative = revenueData.map(item => {
    cumulative += item.revenue;
    return {
      date: item.date,
      revenue: item.revenue,
      transactions: item.transactions,
      cumulative: parseFloat(cumulative.toFixed(2))
    };
  });

  // Get total revenue
  const totalRevenueResult = await SubscriptionTransactionModel.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalRevenue = totalRevenueResult[0]?.total || 0;
  const revenueInPeriod = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  // Revenue by plan
  const revenueByPlan = await SubscriptionTransactionModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: now },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$plan',
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 }
      }
    }
  ]);

  return {
    period,
    periodLabel: period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'Last 12 Months',
    startDate,
    endDate: now,
    data: dataWithCumulative,
    summary: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      revenueInPeriod: parseFloat(revenueInPeriod.toFixed(2)),
      revenueByPlan: revenueByPlan.map(item => ({
        plan: item._id,
        revenue: parseFloat(item.revenue.toFixed(2)),
        transactions: item.transactions
      }))
    }
  };
}

/**
 * Get comprehensive admin dashboard analytics
 * Includes user growth and revenue for multiple periods
 */
export async function getAdminDashboardAnalytics() {
  const now = new Date();

  // Get existing dashboard stats
  const { getDashboardAnalytics } = await import('./adminService.js');

  // Fetch all analytics in parallel
  const [
    currentStats,
    userGrowthWeek,
    userGrowthMonth,
    userGrowthYear,
    revenueGrowthWeek,
    revenueGrowthMonth,
    revenueGrowthYear
  ] = await Promise.all([
    getDashboardAnalytics(),
    getUserGrowthAnalytics('week'),
    getUserGrowthAnalytics('month'),
    getUserGrowthAnalytics('year'),
    getRevenueGrowthAnalytics('week'),
    getRevenueGrowthAnalytics('month'),
    getRevenueGrowthAnalytics('year')
  ]);

  return {
    currentStats,
    userGrowth: {
      week: userGrowthWeek,
      month: userGrowthMonth,
      year: userGrowthYear
    },
    revenueGrowth: {
      week: revenueGrowthWeek,
      month: revenueGrowthMonth,
      year: revenueGrowthYear
    }
  };
}
