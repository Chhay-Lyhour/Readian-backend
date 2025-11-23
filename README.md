<div align="center">

# 📚 Readian - Digital Book Reading & Publishing Platform

<img src="https://via.placeholder.com/200x80?text=Readian" alt="Readian Logo" />

<p><strong>A modern platform for authors and readers to publish, discover, and enjoy digital books</strong></p>

<p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue.svg" alt="License"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version"></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-6.0-green.svg" alt="MongoDB"></a>
</p>

<p>
  <a href="#-documentation">Documentation</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-getting-started">Installation</a> •
  <a href="API_DOCUMENTATION.md">API Docs</a> •
  <a href="#-contributing">Contributing</a>
</p>

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-documentation)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [Age Restriction System](#-age-restriction-system)
- [Subscription System](#-subscription-system)
- [File Upload & Storage](#-file-upload--storage)
- [PDF Generation](#-pdf-generation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

**Readian** is a comprehensive digital book platform that connects authors and readers. Authors can publish their books with multiple chapters, while readers can discover, read, rate, and download books. The platform features a sophisticated subscription system, age-based content filtering, and premium features for enhanced user experience.

### Mission

To democratize publishing and reading by providing a seamless platform where authors can share their stories and readers can discover quality content.

### Vision

To become the leading digital book platform that empowers independent authors and provides readers with diverse, high-quality content.

---

## ✨ Key Features

### For Readers

- 📚 **Browse & Discover** - Explore thousands of books across various genres
- 🔍 **Advanced Search & Filter** - Search by title, author, genre, and tags (all plans)
- 🚀 **Early Access** - Premium users get access to ongoing books
- 📖 **Book Status Filtering** - Free/Basic see finished books, Premium see all
- ⭐ **Rate Books** - Rate books with 1-5 stars
- ❤️ **Like & Bookmark** - Save your favorite books for later
- 📥 **Download as PDF** - Download books for offline reading (Premium)
- 🔒 **Age-Appropriate Content** - Automatic filtering based on user age
- 📱 **Responsive Design** - Access from any device
- 👤 **Personalized Profile** - Customize your avatar and cover image

### For Authors

- ✍️ **Publish Books** - Create books with multiple chapters
- 📝 **Chapter Management** - Add, edit, delete, and reorder chapters
- 🎨 **Cover Images** - Upload custom book covers via Cloudinary
- 📊 **Analytics Dashboard** - Track views, likes, ratings, and downloads
- 💰 **Premium Content** - Mark books as premium for subscribers
- 🔞 **Content Rating** - Set age restrictions (Kids/Adult)
- 📈 **Author Stats** - Comprehensive statistics on your books
- 🚀 **Draft & Publish** - Work on drafts before publishing

### For Admins

- 👥 **User Management** - Full CRUD operations on user accounts
- 📚 **Content Moderation** - Delete any book on the platform
- 📊 **Platform Analytics** - Comprehensive platform-wide statistics including:
  - Total users, books, chapters
  - Subscription breakdown (free, basic, premium)
  - Top books by engagement (views, likes, ratings, downloads)
  - Top authors with performance metrics
  - Revenue tracking
  - User growth trends (last 30 days)
- 🔧 **Role Management** - Assign and modify user roles (READER, AUTHOR, ADMIN)
- 💰 **Subscription Management** - Manage user subscriptions and access

### Platform Features

- 🔐 **Secure Authentication** - JWT-based auth with access & refresh tokens
- 📧 **Email Verification** - Verify user emails with OTP codes
- 🔄 **Token Refresh** - Automatic token refresh for seamless experience
- 🌍 **Cloudinary Integration** - Fast and reliable image storage
- 📄 **PDF Generation** - High-quality PDF exports with PDFKit (PDF only)
- 🛡️ **Rate Limiting** - Protection against abuse
- 🔒 **Security** - Helmet, CORS, and bcrypt for security
- 📱 **RESTful API** - Well-documented, easy-to-integrate API
- 📊 **Public Analytics** - Top books and authors visible on landing page
- ⭐ **Star Ratings** - 1-5 star rating system (no text reviews)
- 🚀 **Auto-Publish** - Authors can publish books without manual review

---

## 🛠 Technology Stack

### Backend

- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.21
- **Language:** JavaScript (ES Modules)

### Database

- **Database:** MongoDB v6.0+
- **ODM:** Mongoose v8.19

### Authentication & Security

- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Security:** Helmet, CORS
- **Rate Limiting:** express-rate-limit


### File Handling

- **Image Upload:** Multer v2.0
- **Cloud Storage:** Cloudinary v2.8
- **PDF Generation:** PDFKit v0.17

### Validation & Error Handling

- **Validation:** Zod v4.1
- **Custom Error Handler:** AppError utility

### Email

- **Email Service:** Nodemailer v7.0

### Logging

- **Logger:** Winston v3.18

### Development Tools

- **Process Manager:** Nodemon
- **Environment Variables:** dotenv

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** (local or MongoDB Atlas) - [Setup Guide](https://www.mongodb.com/docs/manual/installation/)
- **Cloudinary Account** - [Sign Up](https://cloudinary.com/)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Chhay-Lyhour/Readian-backend.git
cd Readian-backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create `.env` file:**

```bash
cp .env.example .env
```

4. **Configure environment variables:**

Edit `.env` with your configuration (see [Environment Variables](#-environment-variables))

5. **Start the server:**

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

6. **Verify installation:**

```bash
curl http://localhost:5001/api/analytics/public
```

If successful, you'll see platform analytics data.

---

## 📁 Project Structure

```
Readian-backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config/                   # Configuration files
│   │   ├── cloudinary.js         # Cloudinary setup
│   │   ├── config.js             # General config
│   │   └── db.js                 # Database connection
│   ├── controllers/              # Request handlers
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── subscriptionController.js
│   │   └── ...
│   ├── models/                   # Database models
│   │   ├── userModel.js
│   │   ├── bookModel.js
│   │   └── ...
│   ├── routes/                   # API routes
│   │   ├── authRoute.js
│   │   ├── bookRoute.js
│   │   ├── subscriptionRoute.js
│   │   └── ...
│   ├── services/                 # Business logic
│   │   ├── authService.js
│   │   ├── subscriptionService.js
│   │   └── ...
│   ├── middlewares/              # Custom middlewares
│   │   ├── authMiddleware.js
│   │   ├── subscriptionMiddleware.js
│   │   └── ...
│   └── utils/                    # Utility functions
│       ├── errorHandler.js
│       └── responseHandler.js
├── uploads/                      # Local file storage
├── .env                          # Environment variables
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/readian
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/readian

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-too
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@readian.com

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# App URL (for webhooks)
APP_URL=http://localhost:5001
```

### Important Notes:

- **Never commit `.env` file to version control**
- Use strong, unique secrets for JWT tokens

---

## 📊 Database Schema

### User Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  age: Number (0-150),
  role: String (enum: ['user', 'admin']),
  isVerified: Boolean,
  profileImage: String (Cloudinary URL),
  coverImage: String (Cloudinary URL),
  plan: String (enum: ['free', 'basic', 'premium']),
  subscriptionStatus: String (enum: ['active', 'inactive']),
  subscriptionExpiresAt: Date,
  subscriptionDuration: Number, // Duration in days (e.g., 30, 90, 365)
  createdAt: Date,
  updatedAt: Date
}
```

### Book Schema

```javascript
{
  title: String (required),
  author: ObjectId (ref: 'User'),
  description: String (max 1000 chars, enticing book description),
  readingTime: String,
  image: String (Cloudinary URL),
  genre: String,
  tags: String (comma-separated),
  isPremium: Boolean,
  contentType: String (enum: ['kids', 'adult']),
  status: String (enum: ['draft', 'published']),
  bookStatus: String (enum: ['ongoing', 'finished']),
  publishedDate: Date,
  viewCount: Number,
  likes: Number,
  likedBy: [ObjectId (ref: 'User')],
  ratings: [{
    user: ObjectId (ref: 'User'),
    rating: Number (1-5 stars only, no text reviews)
  }],
  averageRating: Number (0-5),
  totalRatings: Number,
  downloadCount: Number,
  allowDownload: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 Analytics & Data Visibility

### Admin Analytics (Admin Only)

Admins have access to comprehensive platform analytics via `GET /api/admin/analytics`:

```javascript
{
  "totalUsers": 4,
  "totalBooks": 6,
  "publishedBooks": 3,
  "draftBooks": 3,
  "totalChapters": 28,
  "totalLikes": 1,
  "totalViews": 54,
  "basicSubscribers": 0,
  "premiumSubscribers": 1,
  "freeUsers": 3,
  "revenueThisMonth": 10,
  "users": {
    "total": 4,
    "roles": { "ADMIN": 1, "AUTHOR": 3 },
    "subscriptionBreakdown": {
      "basicSubscribers": 0,
      "premiumSubscribers": 1,
      "freeUsers": 3
    }
  },
  "books": {
    "total": 6,
    "status": { "published": 3, "draft": 3 },
    "premium": 1,
    "totalViews": 54,
    "totalLikes": 1
  },
  "detailed": {
    "newUsersLast30Days": [...],
    "topBooks": [...],      // Includes all engagement metrics
    "topAuthors": [...]     // Includes all author performance data
  }
}
```

### Public Analytics (Everyone)

Public users can access limited analytics via `GET /api/analytics/public`:
- **Top Books**: Most popular books by engagement (visible on landing page)
- **Top Authors**: Most successful authors by metrics (visible on landing page)

**Note**: Public analytics show only aggregated, non-sensitive data suitable for landing page display.

---
- `GET /api/books/:bookId/chapters/:chapterNumber`
- Example: `/api/books/691c2df9ec92a7ce9425f25e/chapters/1`

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration**
   - User provides name, email, password, age
   - System creates account and sends verification email
   - User verifies email with OTP code

2. **Login**
   - User provides email and password
   - System validates credentials
   - Returns access token (15 min) and refresh token (7 days)

3. **Token Usage**
   - Access token included in `Authorization: Bearer <token>` header
   - When expired, use refresh token to get new access token

4. **Logout**
   - Client sends refresh token
   - Server invalidates token

### Authorization Levels

- **Public:** No authentication required (browse kids books)
- **User:** Requires valid access token (read, like, rate)
- **Subscriber:** Requires active subscription (premium books, downloads)
- **Admin:** Requires admin role (user management, analytics)

---

## 🔞 Age Restriction System

Readian implements a comprehensive age-based content filtering system:

### Content Types

1. **Kids Content (`contentType: "kids"`)**
   - Suitable for ages 0-17
   - Accessible to all users (logged in or not)

2. **Adult Content (`contentType: "adult"`)**
   - Restricted to ages 18+
   - Requires user login and age verification

### How It Works

1. **User Age Setup:**
   - Users set their age in profile settings
   - Age field: 0-150 years
   - Required for accessing adult content

2. **Content Filtering:**
   - Users under 18 see only kids content
   - Users 18+ see all content
   - Non-logged users see only kids content

3. **Enforcement:**
   - Applied to all book read endpoints
   - Applied to likes, ratings, and downloads
   - Enforced by `checkAgeRestriction` middleware

4. **Content Type Management:**
   - Authors can change their book's content type
   - Endpoint: `PATCH /api/books/:id/content-type`
   - Values: `"kids"` or `"adult"`
   - Changes take effect immediately
   - Only book author or admin can update

**Example: Update Content Type**
```javascript
// Change book to adult content
PATCH /api/books/book123/content-type
{
  "contentType": "adult"
}

// Change book to kids content
PATCH /api/books/book123/content-type
{
  "contentType": "kids"
}
```

---

## 💳 Subscription System

### Subscription Tiers

| Tier | Price | Duration | Features |
|------|-------|----------|----------|
| **Free** | $0 | Unlimited | - Browse & search all books<br>- Read **finished** free books only<br>- Basic profile<br>- Like and rate books |
| **Basic** | $4.99 | 30/90/365 days | - All Free features<br>- Access to **premium** books<br>- Read **finished** books only<br>- Download premium books<br>- Ad-free experience |
| **Premium** | $9.99 | 30/90/365 days | - All Basic features<br>- **Early access to ongoing books**<br>- Unlimited downloads<br>- Advanced search & filters<br>- Priority support |

**Note:** Subscription duration is flexible and can be set when activating a subscription (default: 30 days).

### Book Access Summary

| Book Type | Free | Basic | Premium |
|-----------|------|-------|---------|
| Finished Free Books | ✅ | ✅ | ✅ |
| Finished Premium Books | ❌ | ✅ | ✅ |
| Ongoing Free Books | ❌ | ❌ | ✅ |
| Ongoing Premium Books | ❌ | ❌ | ✅ |

**Key Differences:**
- **Book Status**: "Finished" = completed books, "Ongoing" = books still being written
- **Free & Basic**: Can only read finished/completed books
- **Premium**: Early access to ongoing books as chapters are released

### Current Implementation Status

⚠️ **Frontend Subscription Payment**: The subscription payment flow in the frontend is currently under development. Backend subscription API is fully functional and ready for integration.

### Features by Tier

```javascript
// Free Tier
- Search & filter books (title, tags, author, genre)
- Browse and read kids books (no age restriction required)
- Browse free adult books (requires age 18+)
- Read FINISHED free books only
- Basic profile customization
- Like and rate books

// Basic Tier ($4.99/month or custom duration)
- All Free tier features
- Access to premium books (isPremium)
- Read FINISHED premium books
- Cannot access ongoing books (must wait for completion)
- Download premium books as PDF
- Ad-free experience
- Enhanced profile features

// Premium Tier ($9.99/month or custom duration)
- All Basic tier features
- EARLY ACCESS to ongoing books (before completion)
- Read chapters as they're released
- Unlimited PDF downloads
- Advanced search and filters
- Priority customer support
- Special badge on profile
```

### How Book Status Works

1. **Ongoing Books** 📝
   - Books currently being written
   - Authors add chapters over time
   - Only Premium users can access
   - Great for serialized content

2. **Finished Books** ✅
   - Completed books with all chapters
   - Available to Free, Basic, and Premium users
   - Full story available immediately

**Example Scenario:**
- Author publishes Chapter 1-5 of an ongoing book
- Premium users can read Chapters 1-5 immediately
- Free/Basic users cannot access the book yet
- Author completes the book (marks as "finished")
- Now Free/Basic users can read the complete book

---


## 📄 File Upload & Storage

### Cloudinary Integration

Readian uses Cloudinary for storing images (book covers, profile images, cover images).

**Features:**
- Automatic image optimization
- CDN delivery for fast loading
- Secure storage
- Transformation capabilities

**Upload Endpoints:**
- `PUT /api/users/profile-image` - Upload profile image
- `PUT /api/users/cover-image` - Upload cover image
- `POST /api/books` - Upload book cover during creation
- `PUT /api/books/:id` - Update book cover

## 📄 PDF Generation

Books can be downloaded as PDFs with:
- Professional formatting
- Chapter organization
- Metadata (title, author, date)
- Optimized for reading

**Supported Format**: PDF only (no EPUB or other formats currently)

---

## 🚀 Deployment

### Prerequisites

- Node.js hosting (Heroku, Railway, DigitalOcean, etc.)
- MongoDB Atlas account
- Cloudinary account
- Domain name (optional)

### Deployment Steps

#### 1. Prepare for Production

```bash
# Set NODE_ENV to production
NODE_ENV=production

# Update environment variables with production values
# - Production MongoDB URI
# - Production frontend URL
```

#### 2. Deploy to Heroku (Example)

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create readian-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_mongodb_uri
# ... set all other env variables

# Deploy
git push heroku main

# Scale
heroku ps:scale web=1

# View logs
heroku logs --tail
```

#### 3. Test Production

- Test registration and login
- Test book uploads and downloads
- Monitor logs for errors

### Environment Variables for Production

Ensure all these are set:
- `NODE_ENV=production`
- `PORT` (usually provided by hosting platform)
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (strong secret)
- `JWT_REFRESH_SECRET` (strong secret)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_*` (production email credentials)
- `FRONTEND_URL` (production frontend URL)
- `APP_URL` (production backend URL)

---

## 🧪 Testing

### API Testing with Postman

See [POSTMAN_TESTING_GUIDE.md](POSTMAN_TESTING_GUIDE.md) for detailed testing procedures.

### Manual Testing Checklist

- [ ] User registration and email verification
- [ ] Login and token refresh
- [ ] Profile image upload to Cloudinary
- [ ] Book creation with cover image
- [ ] Chapter creation and reading
- [ ] Age restriction for adult content
- [ ] Free tier limitations
- [ ] Premium book access with subscription
- [ ] PDF download with active subscription

---

## 📄 Documentation

### Complete Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference with all endpoints
- **[Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md)** - How to integrate with frontend
- **[Postman Testing Guide](POSTMAN_TESTING_GUIDE.md)** - Step-by-step testing procedures
- **[Privacy Policy](PRIVACY_POLICY.md)** - Privacy and data handling policies
- **[Terms and Conditions](TERMS_AND_CONDITIONS.md)** - Terms of service
- **[Documentation Index](DOCUMENTATION_INDEX.md)** - Master documentation index
- **[Changelog](CHANGELOG.md)** - Version history and updates

### Quick Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

---

## 🤝 Contributing

We welcome contributions to Readian! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit:** `git commit -m 'Add amazing feature'`
6. **Push:** `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Coding Standards

- Use ES6+ features
- Follow existing code style
- Add comments for complex logic
- Write descriptive commit messages
- Update documentation for API changes

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- 🌍 Internationalization
- ♿ Accessibility improvements

---

## 📜 License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2025 Readian Team

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 💬 Support

Need help? We're here for you!

### Contact

- **Email:** support@readian.com
- **GitHub Issues:** [Create an issue](https://github.com/Chhay-Lyhour/Readian-backend/issues)
- **Twitter:** [@ReadianApp](https://twitter.com/ReadianApp)
- **Discord:** [Join our community](https://discord.gg/readian)

### FAQ


**Q: Is there a rate limit on the API?**
A: Yes, 100 requests per 15 minutes per IP address.

**Q: How do I reset my database?**
A: Drop the database in MongoDB and restart the server to recreate indexes.

**Q: Can I self-host Readian?**
A: Yes! Follow the deployment guide above.

### Reporting Bugs

When reporting bugs, please include:
1. Expected behavior
2. Actual behavior
3. Steps to reproduce
4. Environment details (Node version, OS, etc.)
5. Error logs (if applicable)

### Feature Requests

Have an idea? [Open a feature request](https://github.com/Chhay-Lyhour/Readian-backend/issues/new?template=feature_request.md)!

---

## 🗺️ Roadmap

### Version 2.0 (Q1 2026)

- [ ] Social features (follow authors, comments)
- [ ] Book recommendations with AI
- [ ] Mobile apps (iOS/Android)
- [ ] Audio book support
- [ ] Multiple language support
- [ ] Advanced analytics for authors
- [ ] Book series management
- [ ] Reading progress tracking
- [ ] Bookmarks and highlights

### Version 3.0 (Q3 2026)

- [ ] Author earnings and payouts
- [ ] Collaborative writing features
- [ ] Book marketplace
- [ ] Live reading events
- [ ] Reader achievements and badges
- [ ] Book clubs and communities

---

## 📊 Project Status

- **Version:** 1.0.0
- **Status:** Production Ready ✅
- **Last Updated:** November 20, 2025
- **Contributors:** 2
- **Open Issues:** 0
- **Closed Issues:** 15

---

## 🙏 Acknowledgments

Special thanks to:

- All contributors who helped build Readian
- The open-source community for amazing tools
- Our beta testers for valuable feedback
- Cloudinary for reliable image hosting
- MongoDB for flexible data storage

---

## 📈 Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/Chhay-Lyhour/Readian-backend?style=social)
![GitHub forks](https://img.shields.io/github/forks/Chhay-Lyhour/Readian-backend?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/Chhay-Lyhour/Readian-backend?style=social)

</div>

---

<div align="center">

**Made with ❤️ by the Readian Team**

⭐ Star us on GitHub — it helps!

[🌐 Website](https://readian.com) • [📧 Email](mailto:support@readian.com) • [🐦 Twitter](https://twitter.com/ReadianApp) • [💬 Discord](https://discord.gg/readian)

</div>

