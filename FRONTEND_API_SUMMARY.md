# 📘 Readian API - Frontend Integration Summary

**Last Updated:** November 20, 2025  
**Base URL:** `http://localhost:5001/api`  
**Status:** ✅ All Features Working

---

## 🚀 Quick Start

### Response Format
All API responses follow this structure:
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... }
}
```

### Authentication
Most endpoints require JWT token in header:
```
Authorization: Bearer <accessToken>
```

---

## 📋 Complete Feature List

### ✅ Implemented & Working Features

1. **Authentication System** ✅
   - Register with email verification
   - Login/Logout (single device & all devices)
   - Token refresh mechanism
   - Password reset flow
   - Password change

2. **User Management** ✅
   - Profile management (name, bio)
   - Profile image upload (Cloudinary)
   - Cover image upload (Cloudinary)
   - Become author functionality
   - View liked books
   - Author statistics

3. **Book Management** ✅
   - Create/Update/Delete books
   - Upload book covers (Cloudinary)
   - Publish/Unpublish books
   - Toggle premium status
   - Update book status (ongoing/finished)
   - Search & filter books
   - Pagination support
   - View count tracking

4. **Chapter Management** ✅
   - Add/Update/Delete chapters
   - Reorder chapters
   - Paginated chapter viewing
   - Auto reading time calculation

5. **Like System** ✅
   - Like/Unlike books
   - View liked books
   - Like count tracking

6. **Rating System** ✅
   - Rate books (1-5 stars)
   - Update ratings
   - Delete ratings
   - View all ratings (paginated)
   - Check personal rating
   - Average rating calculation

7. **Subscription System** ✅
   - Activate subscriptions (basic/premium)
   - Check subscription status
   - Access control for premium content
   - Subscription expiration tracking

8. **Download Feature** ✅ **FIXED & WORKING**
   - Download books as PDF (premium only)
   - Daily limit enforcement (10/day)
   - Download history tracking
   - Download statistics
   - Author analytics
   - Professional PDF formatting
   - Watermarking system

9. **Analytics** ✅ **ENHANCED**
   - Public analytics (top books/authors)
   - Admin analytics dashboard
   - Comprehensive engagement metrics
   - Total likes for books & authors
   - Download counts
   - Rating statistics

10. **Admin Features** ✅
    - Delete any book
    - View all users
    - Update user roles
    - Comprehensive analytics

---

## 🔑 Key API Endpoints by Feature

### Authentication (`/auth`)
```
POST   /register                    - Register new user
POST   /verify-email               - Verify email with code
POST   /resend-verification        - Resend verification code
POST   /login                      - Login user
GET    /me                         - Get current user
POST   /refresh-token              - Refresh access token
POST   /logout                     - Logout (single device)
POST   /logout-all-devices         - Logout all devices
POST   /forgot-password            - Request password reset
POST   /verify-password-reset-code - Verify reset code
POST   /reset-password             - Reset password
POST   /change-password            - Change password (auth required)
```

### Users (`/users`)
```
PATCH  /me                         - Update profile
PATCH  /me/profile-image           - Upload profile image (multipart)
PATCH  /me/cover-image             - Upload cover image (multipart)
POST   /me/become-author           - Become an author
GET    /me/books                   - Get author's books
GET    /me/author-stats            - Get author statistics
GET    /me/liked-books             - Get liked books
GET    /                           - Get all users (admin)
GET    /:id                        - Get user by ID (admin)
PATCH  /:id                        - Update user (admin)
DELETE /:id                        - Delete user (admin)
```

### Books (`/books`)
```
GET    /                           - Get all books (public, paginated)
GET    /search                     - Search books (advanced filters)
GET    /:id                        - Get book by ID with chapters
GET    /:id/chapters               - Get book chapters (paginated)
GET    /:id/chapters/:number       - Get specific chapter
POST   /                           - Create book (author, multipart)
PATCH  /:id                        - Update book (author, multipart)
DELETE /:id                        - Delete book (author)
POST   /:id/publish                - Publish book (author)
POST   /:id/toggle-premium         - Toggle premium status (author)
PATCH  /:id/status                 - Update book status (author)
POST   /:id/chapters               - Add chapter (author)
PATCH  /:id/chapters/:number       - Update chapter (author)
DELETE /:id/chapters/:number       - Delete chapter (author)
POST   /:id/chapters/reorder       - Reorder chapters (author)
POST   /:id/like                   - Like book (auth required)
POST   /:id/unlike                 - Unlike book (auth required)
```

### Ratings (`/books`)
```
POST   /:bookId/rate               - Rate a book (auth required)
GET    /:bookId/rating/me          - Get my rating (auth required)
DELETE /:bookId/rate                - Delete my rating (auth required)
GET    /:bookId/ratings            - Get all ratings (public, paginated)
```

### Downloads (`/downloads` & `/books`)
```
GET    /books/:bookId/download     - Download book as PDF (premium)
GET    /downloads/history          - Get download history (auth)
GET    /downloads/stats            - Get download stats (auth)
GET    /author/downloads/analytics - Get author analytics (author)
```

### Subscriptions (`/subscriptions`)
```
POST   /activate                   - Activate subscription (auth)
GET    /status                     - Get subscription status (auth)
```

### Analytics (`/analytics`)
```
GET    /public                     - Get public analytics (public)
```

### Admin (`/admin`)
```
GET    /analytics                  - Get admin analytics (admin)
DELETE /books/:id                  - Delete any book (admin)
```

---

## 💡 Important Implementation Notes

### 1. Token Management
- **Access Token:** Expires in 15 minutes
- **Refresh Token:** Expires in 7 days
- Implement automatic token refresh
- Store tokens securely (httpOnly cookies recommended)

### 2. File Uploads
Use `FormData` for these endpoints:
- `/users/me/profile-image` → field name: `avatar`
- `/users/me/cover-image` → field name: `coverImage`
- `/books` (create/update) → field name: `image`

**Requirements:**
- Formats: JPG, JPEG, PNG, GIF
- Max size: 5MB
- Images uploaded to Cloudinary

### 3. Pagination
Standard pagination params:
```
?page=1&limit=10
```

Response includes:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBooks": 50,
    "hasMore": true
  }
}
```

### 4. Premium Content Access
**Free Users:**
- Can view/read free books only
- No downloads
- Basic search (title, author)

**Basic Subscribers ($5/month):**
- Access premium books
- Advanced search (genre, tags, sort by likes)
- No downloads

**Premium Subscribers ($10/month):**
- All basic features
- Download books as PDF (10/day limit)
- Download history & stats

**Authors:**
- Always access their own books
- Download own books (unlimited)
- No subscription required for own content

### 5. Book Status Flow
```
Draft → Published → (Ongoing ⟷ Finished)
```

- **Draft:** Only author/admin can see
- **Published:** Public visibility
- **Ongoing:** Book still being written
- **Finished:** Book completed

### 6. Rating System
- Range: 1-5 stars (integer)
- Only authenticated users can rate
- Only published books can be rated
- Users can update their rating anytime
- Average calculated automatically
- Displayed with 1 decimal (e.g., 4.3)

### 7. Download Feature ⚠️ IMPORTANT
**Recent Fix Applied:** The download feature had an infinite recursion bug that has been **FIXED**.

**How it works now:**
1. User requests download → checks premium status
2. PDF generated with all chapters
3. Page numbers added to all pages
4. Watermark added (user email, subtle)
5. Download tracked in database
6. Daily limit enforced (10 downloads)

**PDF Features:**
- ✅ Title page with metadata
- ✅ Table of contents
- ✅ All chapters formatted
- ✅ Page numbers (bottom center)
- ✅ Watermark (Licensed to: email@example.com)
- ✅ Improved layout (50px margins)
- ✅ Professional formatting

### 8. Analytics Data ✨ ENHANCED
**Top Books include:**
- View count
- Total likes count ✅
- Average rating
- Total ratings
- Download count ✅
- Engagement object ✅

**Top Authors include:**
- Total views
- Total likes count ✅
- Total ratings ✅
- Total downloads ✅
- Average rating ✅
- Book count
- Engagement object ✅

---

## 🔒 Role-Based Access Control

### Public (No Auth)
- View published books
- Search books (basic)
- View public analytics
- View book ratings

### READER (Authenticated)
- All public features
- Like/unlike books
- Rate books
- Update profile
- Upload images
- View liked books

### AUTHOR (Author role)
- All reader features
- Create/update/delete own books
- Manage own chapters
- Publish own books
- View author stats
- Download own books (unlimited)
- Access author analytics

### ADMIN
- All author features
- Delete any book
- View all users
- Update any user
- Access admin analytics
- Full system access

---

## 📊 Data Models Summary

### User Object
```typescript
{
  _id: string
  name: string
  email: string
  role: "READER" | "AUTHOR" | "ADMIN"
  email_verified: boolean
  plan: "free" | "basic" | "premium"
  subscriptionStatus: "active" | "inactive" | "expired"
  subscriptionExpiresAt?: Date
  avatar?: string  // Cloudinary URL
  coverImage?: string  // Cloudinary URL
  bio?: string
  likedBooks: string[]  // Book IDs
  createdAt: Date
  updatedAt: Date
}
```

### Book Object
```typescript
{
  _id: string
  title: string
  description?: string
  author: string | User  // User ID or populated object
  genre: string
  tags: string
  image?: string  // Cloudinary URL
  status: "draft" | "published"
  bookStatus: "ongoing" | "finished"
  isPremium: boolean
  allowDownload: boolean
  viewCount: number
  likes: number
  likedBy: string[]  // User IDs
  averageRating: number
  totalRatings: number
  ratings: [{
    user: string,
    rating: number,
    createdAt: Date
  }]
  readingTime?: string
  publishedDate?: Date
  downloadCount: number
  totalChapters: number
  createdAt: Date
  updatedAt: Date
}
```

### Chapter Object
```typescript
{
  _id: string
  title: string
  content: string
  book: string  // Book ID
  chapterNumber: number
  createdAt: Date
  updatedAt: Date
}
```

### Download Object
```typescript
{
  _id: string
  user: string  // User ID
  book: string  // Book ID
  downloadDate: Date
  ipAddress: string
}
```

---

## 🐛 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### Common Error Codes
```typescript
// Authentication
"INVALID_CREDENTIALS"
"TOKEN_EXPIRED"
"TOKEN_INVALID"
"EMAIL_NOT_VERIFIED"
"EMAIL_ALREADY_EXISTS"

// Authorization
"UNAUTHORIZED"
"FORBIDDEN"
"PREMIUM_REQUIRED"
"SUBSCRIPTION_EXPIRED"
"ADMIN_REQUIRED"
"AUTHOR_REQUIRED"

// Resources
"BOOK_NOT_FOUND"
"CHAPTER_NOT_FOUND"
"USER_NOT_FOUND"
"RATING_NOT_FOUND"

// Validation
"INVALID_INPUT"
"INVALID_RATING"
"REQUIRED_FIELD_MISSING"

// Business Logic
"BOOK_NOT_PUBLISHED"
"DOWNLOAD_DISABLED"
"DOWNLOAD_LIMIT_REACHED"
"NO_CHAPTERS"
```

---

## 🧪 Testing Checklist

### Phase 1: Authentication
- [ ] Register new user
- [ ] Verify email with code
- [ ] Login successfully
- [ ] Get current user profile
- [ ] Refresh access token
- [ ] Change password
- [ ] Logout

### Phase 2: User Profile
- [ ] Update profile (name, bio)
- [ ] Upload profile image
- [ ] Upload cover image
- [ ] Become an author

### Phase 3: Book Management
- [ ] Create book with cover image
- [ ] Add chapters to book
- [ ] Update book details
- [ ] Publish book
- [ ] Toggle premium status
- [ ] View book with chapters

### Phase 4: Interactions
- [ ] Like a book
- [ ] Unlike a book
- [ ] Rate a book (1-5 stars)
- [ ] Update rating
- [ ] Delete rating
- [ ] View all ratings
- [ ] View liked books

### Phase 5: Search & Browse
- [ ] Get all books (paginated)
- [ ] Search by title
- [ ] Search by author
- [ ] Filter by genre (premium)
- [ ] Sort by likes (premium)

### Phase 6: Subscriptions
- [ ] Activate subscription
- [ ] Check subscription status
- [ ] Access premium book (with subscription)
- [ ] Try access without subscription (should fail)

### Phase 7: Downloads
- [ ] Download book as PDF (premium user)
- [ ] Check download history
- [ ] View download statistics
- [ ] Try download without premium (should fail)
- [ ] Try download after limit (should fail)
- [ ] Author download own book (should work)

### Phase 8: Analytics
- [ ] Get public analytics
- [ ] Verify top books have totalLikes
- [ ] Verify top authors have totalLikes & engagement
- [ ] Get author stats (as author)
- [ ] Get admin analytics (as admin)

### Phase 9: Admin
- [ ] View all users (as admin)
- [ ] Update user role (as admin)
- [ ] Delete any book (as admin)

---

## 🎯 Recommended Frontend Flow

### 1. Initial Load
```
1. Check for stored tokens
2. If tokens exist → GET /auth/me
3. If valid → Load user state
4. If invalid → Clear tokens, show login
```

### 2. Browse Books
```
1. GET /books?page=1&limit=10
2. Display book cards
3. On scroll → Load next page
4. On book click → GET /books/:id
```

### 3. Read Book
```
1. GET /books/:id (includes first page of chapters)
2. Display book info
3. On "next chapter" → GET /books/:id/chapters?page=2
4. Track view count (automatic on first GET)
```

### 4. Like/Rate Book
```
1. User clicks like → POST /books/:id/like
2. Update UI optimistically
3. User rates → POST /books/:bookId/rate
4. Update rating display
```

### 5. Download Book
```
1. Check user is premium → GET /subscriptions/status
2. If premium → GET /books/:id/download
3. Handle PDF file stream
4. Save as file download
```

### 6. Author Dashboard
```
1. GET /users/me/books?status=published
2. GET /users/me/author-stats
3. GET /author/downloads/analytics
4. Display author dashboard
```

---

## 🔔 Real-Time Considerations

Currently, the API uses HTTP requests. For real-time features, consider:

### Polling Strategy
- **Book view counts**: Refresh every 30 seconds
- **Like counts**: Refresh every 10 seconds
- **Analytics**: Refresh every 5 minutes
- **Download stats**: Refresh every minute

### WebSocket Future
Consider adding WebSocket support for:
- Real-time view count updates
- Live like notifications
- New chapter notifications
- Real-time analytics

---

## 📦 Recommended Frontend Libraries

### API Client
```bash
npm install axios
# or
npm install @tanstack/react-query  # For React
```

### File Upload
```bash
npm install axios  # Has FormData support
```

### PDF Download
```javascript
// Use native fetch or axios
// Handle as blob response
const response = await axios.get('/books/:id/download', {
  responseType: 'blob'
});
const url = window.URL.createObjectURL(response.data);
const link = document.createElement('a');
link.href = url;
link.download = 'book.pdf';
link.click();
```

### State Management
```bash
npm install zustand  # Simple state management
# or
npm install @reduxjs/toolkit  # For larger apps
```

---

## 🚨 Critical Notes

### 1. **Download Feature is WORKING** ✅
The maximum call stack issue has been **FIXED**. PDFs now generate correctly with:
- Improved page layout (50px margins vs 72px)
- Page numbers on all pages
- Watermarks on all pages
- No infinite recursion
- Better content utilization

### 2. **Analytics Enhanced** ✅
Top books and top authors now include:
- `totalLikes` count
- `downloadCount` for books
- `totalRatings` for authors
- `totalDownloads` for authors
- `averageRating` for authors
- `engagement` object with all metrics

### 3. **Rating System Complete** ✅
Full CRUD operations working:
- Create/Update ratings
- Delete ratings
- View all ratings (paginated)
- Check personal rating
- Automatic average calculation

### 4. **Cloudinary Integration** ✅
All image uploads go to Cloudinary:
- Profile images → `profile_images` folder
- Cover images → `cover_images` folder
- Book covers → `book_covers` folder

### 5. **Subscription System** ✅
Fully functional with three tiers:
- Free: Basic reading
- Basic ($5): Premium books + advanced search
- Premium ($10): Everything + downloads

---

## 📞 Support & Documentation

### Full Documentation
- **Complete API Docs**: `COMPLETE_API_DOCUMENTATION.md` (2233 lines)
- **Testing Guide**: `COMPLETE_TESTING_GUIDE.md`
- **Download Fix**: `DOWNLOAD_FIX_APPLIED.md`
- **Implementation Summary**: `DOWNLOAD_RATING_ANALYTICS_FIXES.md`

### Quick References
- **Base URL**: `http://localhost:5001/api`
- **Server Port**: 5001
- **MongoDB**: `mongodb://localhost:27017/readian`
- **Uploads**: `http://localhost:5001/uploads/`

---

## ✅ Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Working | Full flow including email verification |
| User Management | ✅ Working | Profile, images, author status |
| Book CRUD | ✅ Working | Create, read, update, delete, publish |
| Chapter Management | ✅ Working | Add, update, delete, reorder |
| Like System | ✅ Working | Like/unlike with tracking |
| Rating System | ✅ Working | Full CRUD, average calculation |
| Search & Filter | ✅ Working | Basic (public) + Advanced (premium) |
| Subscriptions | ✅ Working | Three tiers, access control |
| Downloads | ✅ **FIXED** | PDF generation working, daily limits |
| Analytics | ✅ **ENHANCED** | Public + admin, comprehensive metrics |
| Image Upload | ✅ Working | Cloudinary integration |
| Admin Features | ✅ Working | User/book management, analytics |

**Overall Status**: 🟢 **ALL SYSTEMS OPERATIONAL**

---

**Last Tested**: November 20, 2025  
**Server Status**: ✅ Running on port 5001  
**Database**: ✅ MongoDB connected  
**Cloudinary**: ✅ Configured  

---

## 🎉 Ready for Frontend Integration!

All backend features are implemented, tested, and working. The frontend team can now:

1. Start integrating authentication
2. Build book browsing/reading UI
3. Implement user profiles
4. Add book creation/management for authors
5. Build download feature UI
6. Create analytics dashboards
7. Implement subscription flow

**Happy Coding!** 🚀

