# Readian Backend Project - Complete Understanding

## 🎯 Project Overview

**Readian** is a **book reading platform API** (like Wattpad or Medium for books) built with Node.js, Express, and MongoDB. It allows:
- **Authors** to publish books with multiple chapters
- **Readers** to read books (free or premium)
- **Subscriptions** for premium content access
- **Social features** like liking books
- **Analytics** for authors to track their book performance

---

## 🏗️ Architecture & Technology Stack

### **Tech Stack**
- **Runtime**: Node.js (v24.4.1)
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary (with local storage fallback)
- **Validation**: Zod
- **Email**: Nodemailer
- **Security**: Helmet, CORS, bcryptjs
- **Testing**: Jest + Supertest
- **Dev Tools**: Nodemon, Babel

### **Project Structure**
```
src/
├── app.js                 # Express app configuration
├── server.js              # Server startup
├── config/                # Configuration files
│   ├── cloudinary.js      # Cloudinary setup
│   ├── config.js          # Environment variables
│   ├── db.js              # MongoDB connection
│   └── staticFiles.js     # Static file serving
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── bookController.js
│   ├── chapterController.js   # 🆕 NEW
│   ├── userController.js
│   ├── likeController.js
│   ├── subscriptionController.js
│   └── analyticsController.js
├── services/              # Business logic
│   ├── authService.js
│   ├── bookService.js
│   ├── chapterService.js      # 🆕 NEW
│   ├── userService.js
│   ├── likeService.js
│   ├── subscriptionService.js
│   ├── uploadService.js
│   ├── localUploadService.js  # 🆕 NEW
│   └── email.js
├── models/                # Mongoose schemas
│   ├── userModel.js
│   ├── bookModel.js
│   ├── chapterModel.js
│   ├── refreshTokenModel.js
│   └── emailVerificationModel.js
├── routes/                # API routes
│   ├── authRoute.js
│   ├── bookRoute.js
│   ├── userRoute.js
│   ├── subscriptionRoute.js
│   ├── analyticsRoute.js
│   └── adminRoute.js
├── dto/                   # Validation schemas (Zod)
│   ├── authValidationSchemas.js
│   ├── bookValidationSchemas.js
│   ├── chapterValidationSchemas.js  # 🆕 NEW
│   └── userValidationSchemas.js
├── middlewares/           # Express middlewares
│   ├── authMiddleware.js
│   ├── errorHandlingMiddleware.js
│   ├── requestValidatorMiddleware.js
│   └── uploadMiddleware.js
├── repositories/          # Database access layer
│   ├── authRepositories.js
│   └── userRepositories.js
└── utils/                 # Helper utilities
    ├── errorHandler.js
    ├── responseHandler.js
    └── readingTimeCalculator.js
```

---

## 👥 User System

### **User Roles**
1. **READER** - Can read free books
2. **AUTHOR** - Can create and publish books
3. **ADMIN** - Full system access

### **User Model Fields**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  role: "READER" | "AUTHOR" | "ADMIN",
  email_verified: Boolean,
  
  // Subscription
  plan: "free" | "basic" | "premium",
  subscriptionStatus: "active" | "inactive",
  subscriptionExpiresAt: Date,
  
  // Profile
  avatar: String (image URL),
  bio: String,
  
  // Social
  likedBooks: [Book IDs],
  
  timestamps: { createdAt, updatedAt }
}
```

### **Authentication Flow**
1. **Register** → User signs up → Email verification code sent
2. **Verify Email** → User enters code → Account activated
3. **Login** → Returns access token + refresh token
4. **Refresh Token** → Get new access token when expired
5. **Logout** → Invalidate refresh token
6. **Password Reset** → Forgot password → Code via email → Reset

---

## 📚 Book System

### **Book Model**
```javascript
{
  title: String,
  author: User ID (reference),
  status: "draft" | "published",
  isPremium: Boolean,
  
  // Content
  readingTime: String (auto-calculated),
  chapters: [stored in separate Chapter collection],
  
  // Metadata
  genre: String,
  tags: String,
  rating: Number,
  image: String (cover image URL),
  publishedDate: Date,
  
  // Stats
  viewCount: Number,
  likes: Number,
  likedBy: [User IDs],
  
  timestamps: { createdAt, updatedAt }
}
```

### **Chapter Model**
```javascript
{
  title: String,
  content: String (the actual chapter text),
  book: Book ID (reference),
  chapterNumber: Number (1, 2, 3...),
  timestamps: { createdAt, updatedAt }
}
```

### **Book Lifecycle**
```
1. Author creates book (status: "draft")
   ↓
2. Author adds chapters
   ↓
3. Author publishes book (status: "published")
   ↓
4. Readers can view/read published books
   ↓
5. Premium books require active subscription
```

---

## 🔐 Access Control & Permissions

### **Book Visibility Rules**
| Book Type | Status | Who Can View |
|-----------|--------|--------------|
| Free | Draft | Author, Admin only |
| Free | Published | Everyone |
| Premium | Draft | Author, Admin only |
| Premium | Published | Subscribers + Author + Admin |

### **Chapter Management Rules**
- ✅ Only the **book author** can add/edit/delete chapters
- ✅ **Admins** have full access
- ❌ Other users cannot modify chapters

### **Reading Access**
- **Free books**: Anyone can read (after publication)
- **Premium books**: Requires active subscription
- **Draft books**: Only author/admin can preview

---

## 🎯 Core Features

### **1. Authentication & User Management**
- ✅ User registration with email verification
- ✅ Login with JWT tokens (access + refresh)
- ✅ Password reset via email
- ✅ Profile management (name, bio, avatar)
- ✅ Role upgrade (Reader → Author)
- ✅ Avatar upload (Cloudinary or local storage)

### **2. Book Management**
- ✅ Create books with initial chapters
- ✅ Update book metadata (title, genre, tags, cover image)
- ✅ Publish/unpublish books
- ✅ Delete books
- ✅ Get all books (paginated)
- ✅ Search and filter books (by title, author, genre, tags)
- ✅ View count tracking
- ✅ Auto-calculate reading time

### **3. Chapter Management** 🆕
- ✅ Add individual chapters to existing books
- ✅ Update chapter title/content
- ✅ Delete chapters (auto-renumbers remaining)
- ✅ Reorder chapters
- ✅ Get all chapters (paginated)
- ✅ Get specific chapter by number
- ✅ Navigation info (next/previous chapter)

### **4. Social Features**
- ✅ Like/unlike books
- ✅ View liked books collection (with full book details)
- ✅ Like count on books
- ✅ Track who liked each book

### **5. Subscription System**
- ✅ Three plans: Free, Basic, Premium
- ✅ Upgrade/downgrade subscriptions
- ✅ Subscription expiration tracking
- ✅ Auto-downgrade expired subscriptions
- ✅ Premium content access control

### **6. Analytics**
- ✅ Author statistics (total books, views, likes)
- ✅ Most viewed books
- ✅ Book performance tracking

### **7. File Upload** 🆕
- ✅ **Dual-mode**: Cloudinary (preferred) + Local storage (fallback)
- ✅ Profile image upload
- ✅ Book cover image upload
- ✅ File validation (type, size)
- ✅ Automatic unique filename generation

---

## 🔄 API Endpoints Overview

### **Authentication** (`/api/auth`)
```
POST   /register               - Register new user
POST   /verify-email           - Verify email with code
POST   /resend-verification    - Resend verification code
POST   /login                  - Login user
POST   /refresh-token          - Get new access token
POST   /logout                 - Logout (invalidate token)
POST   /logout-all             - Logout from all devices
POST   /forgot-password        - Request password reset
POST   /verify-reset-code      - Verify reset code
POST   /reset-password         - Reset password
GET    /me                     - Get current user info
```

### **Users** (`/api/users`)
```
PATCH  /me                     - Update profile
PATCH  /me/profile-image       - Upload avatar 🆕
POST   /me/become-author       - Upgrade to author
GET    /me/books               - Get my books (authors)
GET    /me/author-stats        - Get author statistics
GET    /me/liked-books         - Get liked books 🆕 (ENHANCED)
POST   /me/change-password     - Change password

# Admin only
GET    /                       - Get all users
GET    /:id                    - Get user by ID
PATCH  /:id                    - Update user
DELETE /:id                    - Delete user
```

### **Books** (`/api/books`)
```
# Public
GET    /                       - Get all published books
GET    /search                 - Search & filter books
GET    /:id                    - Get book by ID

# Authenticated
POST   /:id/like               - Like a book
POST   /:id/unlike             - Unlike a book

# Author/Admin only
POST   /                       - Create book (with cover)
PATCH  /:id                    - Update book
DELETE /:id                    - Delete book
POST   /:id/publish            - Publish book
```

### **Chapters** (`/api/books/:bookId`) 🆕
```
# Reading (public for published, auth for drafts)
GET    /:id/chapters                    - Get all chapters (paginated)
GET    /:id/chapters/:chapterNumber     - Get specific chapter

# Management (Author/Admin only)
POST   /:bookId/chapters                - Add chapter
PATCH  /:bookId/chapters/:chapterNumber - Update chapter
DELETE /:bookId/chapters/:chapterNumber - Delete chapter
POST   /:bookId/chapters/reorder        - Reorder chapters
```

### **Subscriptions** (`/api/subscriptions`)
```
POST   /subscribe              - Subscribe to a plan
GET    /plans                  - Get available plans
```

### **Analytics** (`/api/analytics`)
```
GET    /most-viewed            - Get most viewed books
```

### **Admin** (`/api/admin`)
```
GET    /analytics              - Get system analytics
```

---

## 🔑 Key Business Logic

### **1. Reading Time Calculation**
- Automatically calculated when book/chapters are created/updated
- Based on average reading speed (200 words per minute)
- Format: "X min read"

### **2. Subscription Enforcement**
```javascript
// When accessing premium book:
if (book.isPremium) {
  if (!user || !user.subscriptionActive) {
    throw Error("SUBSCRIPTION_REQUIRED")
  }
}
```

### **3. Draft Book Visibility**
```javascript
// Only author or admin can see drafts:
if (book.status === "draft") {
  if (user.id !== book.author && user.role !== "ADMIN") {
    throw Error("BOOK_NOT_FOUND") // Hide existence
  }
}
```

### **4. Chapter Numbering**
- Automatically assigned when adding chapters
- Auto-renumbered when deleting chapters
- Example: Delete chapter 2 → chapter 3 becomes chapter 2

### **5. Like/Unlike Logic**
- Prevents double-liking
- Updates both Book.likedBy[] and User.likedBooks[]
- Uses MongoDB transactions for consistency
- Updates like count atomically

---

## 🆕 What I Added/Fixed

### **Problem 1: No Chapter Management**
**Before**: Authors had to update entire book to modify chapters
**After**: Full CRUD on individual chapters
- Add single chapter
- Update chapter content
- Delete chapter (auto-renumber)
- Reorder chapters

### **Problem 2: No Local File Upload**
**Before**: Required Cloudinary (external service)
**After**: Dual-mode system
- Uses Cloudinary if configured
- Automatic fallback to local storage
- Files saved in `/uploads/` directory
- Served at `/uploads/...` URLs

### **Problem 3: Liked Books Only Returned IDs**
**Before**: `GET /api/users/me/liked-books` returned `[book_id1, book_id2]`
**After**: Returns full book objects with all metadata
```javascript
[{
  _id: "...",
  title: "Book Title",
  author: "...",
  image: "/uploads/book_covers/...",
  genre: "Fantasy",
  likes: 150,
  // ... all book fields
}]
```

### **Problem 4: Reading Books/Chapters**
**Solution**: The endpoints already existed and work correctly:
- `GET /api/books/:id/chapters` - Get all chapters
- `GET /api/books/:id/chapters/:chapterNumber` - Get specific chapter
- Both enforce access control (draft, premium, subscription)

---

## 🧪 Testing

### **Test Suites**
- `authService.test.js` - Authentication tests
- `likeService.test.js` - Like/unlike tests
- `bookRoute.test.js` - Book API tests
- `analyticsRoute.test.js` - Analytics tests
- `chapterRoute.test.js` 🆕 - Chapter management tests

### **Run Tests**
```bash
npm test                        # Run all tests
npm test -- chapterRoute.test.js  # Run specific test
```

---

## 🚀 How to Run

### **1. Environment Setup**
Create `.env` file:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/readian
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
FRONTEND_URL=http://localhost:3000

# Optional (for Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email (for verification)
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Start Server**
```bash
npm run dev  # Development mode with nodemon
```

### **4. Server Ready**
```
Server is running on port 5001
MongoDB connected successfully
```

---

## 💡 Key Insights

### **Architecture Patterns**
1. **Layered Architecture**: Routes → Controllers → Services → Repositories → Models
2. **Separation of Concerns**: Each layer has specific responsibility
3. **DTO Pattern**: Validation schemas separate from business logic
4. **Repository Pattern**: Database access abstracted
5. **Middleware Pattern**: Reusable authentication, validation, error handling

### **Security Features**
- ✅ Password hashing (bcryptjs)
- ✅ JWT authentication
- ✅ Refresh token rotation
- ✅ Email verification
- ✅ Role-based access control (RBAC)
- ✅ Input validation (Zod)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting

### **Data Integrity**
- ✅ MongoDB transactions for atomic operations
- ✅ Mongoose schema validation
- ✅ Unique indexes (email, book-chapter combination)
- ✅ Cascade operations (e.g., deleting chapters updates reading time)
- ✅ Optimistic locking for concurrent updates

---

## 📊 Database Schema Relationships

```
User (1) ----< (many) Books
  |                      |
  |                      |
  | likedBooks[]      (1 to many)
  |                      |
  └──────────────────> Book
                         |
                         | (1 to many)
                         |
                         └───> Chapters

User (1) ----< (many) RefreshTokens
User (1) ----< (many) EmailVerifications
```

---

## 🎯 Use Cases

### **Use Case 1: Author Publishes a Book**
1. Author registers → Verifies email → Becomes author
2. Creates book with initial chapters (draft)
3. Uploads book cover image
4. Adds more chapters individually
5. Reviews and reorders chapters
6. Publishes book
7. Tracks views and likes via analytics

### **Use Case 2: Reader Reads a Book**
1. Reader browses published books
2. Searches by title/genre/tags
3. Clicks on a book → Views details
4. Reads chapters sequentially
5. Likes the book
6. Views their liked books collection

### **Use Case 3: Premium Content**
1. Reader tries to access premium book
2. System checks subscription status
3. If no subscription → Shows "Subscribe" message
4. Reader subscribes to premium plan
5. Can now access all premium books
6. Subscription auto-expires after duration

---

## 🔮 Summary

**Readian Backend** is a **production-ready book publishing platform API** with:
- ✅ Complete authentication system
- ✅ Multi-role user management
- ✅ Full book & chapter CRUD operations
- ✅ Premium content with subscriptions
- ✅ Social features (likes)
- ✅ File upload (cloud + local)
- ✅ Analytics & reporting
- ✅ Comprehensive security
- ✅ Clean architecture

It's basically **Wattpad/Medium for books** with a robust backend that handles everything from user authentication to premium subscriptions! 🚀

