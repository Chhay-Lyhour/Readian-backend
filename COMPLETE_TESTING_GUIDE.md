# 📚 Complete API Testing Guide - Readian Backend

## Table of Contents
1. [Download Feature](#download-feature)
2. [Rating Feature](#rating-feature)
3. [Analytics Feature](#analytics-feature)
4. [Cloudinary Image Upload](#cloudinary-image-upload)

---

## 🔐 Authentication Required

Most endpoints require authentication. Include this header in your requests:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

To get a token, login first:
```http
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

---

## 📥 Download Feature

### 1. Download a Book as PDF

**Endpoint**: `GET /api/books/:bookId/download`

**Access**: 
- Premium subscribers can download any published book
- Authors can download their own books (regardless of subscription)
- Daily limit: 10 downloads per user

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example Request (Postman)**:
```
GET http://localhost:5001/api/books/67890abcdef12345/download
```

**Response**: PDF file download

**Features**:
- ✅ Professional PDF layout with optimized margins
- ✅ Title page with book metadata
- ✅ Table of contents
- ✅ All chapters with proper formatting
- ✅ Page numbers on every page
- ✅ User email watermark (subtle, at bottom)
- ✅ Better page utilization (50px margins instead of 72px)
- ✅ Improved font sizes and spacing
- ✅ Justified text alignment

**Error Responses**:
```json
// Not a premium subscriber
{
  "success": false,
  "message": "Premium subscription required",
  "errorCode": "PREMIUM_REQUIRED"
}

// Daily limit reached
{
  "success": false,
  "message": "You have reached your daily download limit of 10 books",
  "errorCode": "DOWNLOAD_LIMIT_REACHED"
}

// Book not found
{
  "success": false,
  "message": "Book not found",
  "errorCode": "BOOK_NOT_FOUND"
}
```

---

### 2. Get Download History

**Endpoint**: `GET /api/downloads/history`

**Access**: Private (Authenticated users)

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Example Request**:
```
GET http://localhost:5001/api/downloads/history?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:
```json
{
  "success": true,
  "message": "Download history retrieved successfully",
  "data": {
    "downloads": [
      {
        "_id": "download123",
        "user": "user123",
        "book": {
          "_id": "book123",
          "title": "The Great Adventure",
          "author": "author123",
          "image": "https://cloudinary.../cover.jpg",
          "genre": "Fantasy"
        },
        "downloadDate": "2025-11-20T10:30:00.000Z",
        "ipAddress": "127.0.0.1"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDownloads": 25,
      "limit": 10
    }
  }
}
```

---

### 3. Get Download Statistics

**Endpoint**: `GET /api/downloads/stats`

**Access**: Private (Authenticated users)

**Example Request**:
```
GET http://localhost:5001/api/downloads/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:
```json
{
  "success": true,
  "message": "Download statistics retrieved successfully",
  "data": {
    "totalDownloads": 25,
    "downloadsToday": 3,
    "downloadsThisMonth": 18,
    "remainingToday": 7,
    "dailyLimit": 10
  }
}
```

---

### 4. Get Author Download Analytics

**Endpoint**: `GET /api/author/downloads/analytics`

**Access**: Private (Authors only)

**Example Request**:
```
GET http://localhost:5001/api/author/downloads/analytics
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:
```json
{
  "success": true,
  "message": "Download analytics retrieved successfully",
  "data": {
    "totalDownloads": 150,
    "downloadsThisMonth": 45,
    "downloadsPerBook": [
      {
        "bookId": "book123",
        "bookTitle": "The Great Adventure",
        "downloadCount": 75
      },
      {
        "bookId": "book456",
        "bookTitle": "Mystery Novel",
        "downloadCount": 50
      }
    ]
  }
}
```

---

## ⭐ Rating Feature

### 1. Rate a Book

**Endpoint**: `POST /api/books/:bookId/rate`

**Access**: Private (Authenticated users)

**Body**:
```json
{
  "rating": 5
}
```

**Validation**:
- Rating must be between 1 and 5 (integer)
- Book must be published

**Example Request**:
```
POST http://localhost:5001/api/books/67890abcdef12345/rate
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "rating": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Rating added successfully",
  "data": {
    "averageRating": "4.5",
    "totalRatings": 10,
    "yourRating": 5
  }
}
```

**Update Existing Rating**:
If you already rated this book, it will update your previous rating:
```json
{
  "success": true,
  "message": "Rating updated successfully",
  "data": {
    "averageRating": "4.6",
    "totalRatings": 10,
    "yourRating": 5
  }
}
```

---

### 2. Get My Rating for a Book

**Endpoint**: `GET /api/books/:bookId/rating/me`

**Access**: Private (Authenticated users)

**Example Request**:
```
GET http://localhost:5001/api/books/67890abcdef12345/rating/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (If rated)**:
```json
{
  "success": true,
  "message": "Rating retrieved successfully",
  "data": {
    "rating": 5,
    "ratedAt": "2025-11-20T10:30:00.000Z"
  }
}
```

**Response (If not rated)**:
```json
{
  "success": true,
  "message": "You haven't rated this book yet",
  "data": {
    "rating": null,
    "ratedAt": null
  }
}
```

---

### 3. Delete My Rating

**Endpoint**: `DELETE /api/books/:bookId/rate`

**Access**: Private (Authenticated users)

**Example Request**:
```
DELETE http://localhost:5001/api/books/67890abcdef12345/rate
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:
```json
{
  "success": true,
  "message": "Rating deleted successfully",
  "data": {
    "averageRating": "4.4",
    "totalRatings": 9
  }
}
```

---

### 4. Get All Ratings for a Book

**Endpoint**: `GET /api/books/:bookId/ratings`

**Access**: Public (No authentication required)

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Example Request**:
```
GET http://localhost:5001/api/books/67890abcdef12345/ratings?page=1&limit=10
```

**Response**:
```json
{
  "success": true,
  "message": "Book ratings retrieved successfully",
  "data": {
    "bookTitle": "The Great Adventure",
    "averageRating": 4.5,
    "totalRatings": 10,
    "ratings": [
      {
        "user": {
          "id": "user123",
          "name": "John Doe",
          "avatar": "https://cloudinary.../avatar.jpg"
        },
        "rating": 5,
        "ratedAt": "2025-11-20T10:30:00.000Z"
      },
      {
        "user": {
          "id": "user456",
          "name": "Jane Smith",
          "avatar": "https://cloudinary.../avatar2.jpg"
        },
        "rating": 4,
        "ratedAt": "2025-11-19T15:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRatings": 10,
      "limit": 10
    }
  }
}
```

---

## 📊 Analytics Feature

### Get Public Analytics

**Endpoint**: `GET /api/analytics/public`

**Access**: Public (No authentication required)

**Example Request**:
```
GET http://localhost:5001/api/analytics/public
```

**Response**:
```json
{
  "success": true,
  "message": "Public analytics retrieved successfully.",
  "data": {
    "topBooks": [
      {
        "_id": "book123",
        "title": "The Great Adventure",
        "description": "An epic fantasy journey...",
        "author": {
          "_id": "author123",
          "name": "John Author",
          "avatar": "https://cloudinary.../avatar.jpg"
        },
        "image": "https://cloudinary.../cover.jpg",
        "genre": "Fantasy",
        "isPremium": false,
        "publishedDate": "2025-01-15T00:00:00.000Z",
        "viewCount": 1500,
        "totalLikes": 120,
        "averageRating": 4.5,
        "totalRatings": 80,
        "downloadCount": 45,
        "engagement": {
          "views": 1500,
          "likes": 120,
          "ratings": 80,
          "downloads": 45
        }
      }
    ],
    "topAuthors": [
      {
        "authorId": "author123",
        "authorName": "John Author",
        "authorEmail": "john@example.com",
        "authorAvatar": "https://cloudinary.../avatar.jpg",
        "totalViews": 5000,
        "totalLikes": 350,
        "totalRatings": 200,
        "totalDownloads": 150,
        "averageRating": 4.6,
        "bookCount": 5,
        "engagement": {
          "views": 5000,
          "likes": 350,
          "ratings": 200,
          "downloads": 150
        }
      }
    ]
  }
}
```

**Features**:
- ✅ Top 5 books by view count
- ✅ Top 5 authors by total views
- ✅ Comprehensive engagement metrics for both
- ✅ Total likes count for books and authors
- ✅ Rating statistics
- ✅ Download counts
- ✅ Author information with avatar

---

## 🖼️ Cloudinary Image Upload

### 1. Update Profile Image

**Endpoint**: `PATCH /api/users/me/profile-image`

**Access**: Private (Authenticated users)

**Content-Type**: `multipart/form-data`

**Form Data**:
- `avatar`: Image file (jpg, jpeg, png, gif)

**Example Request (Postman)**:
1. Select `POST` method
2. Enter URL: `http://localhost:5001/api/users/me/profile-image`
3. Go to **Headers** tab:
   - Add `Authorization: Bearer YOUR_JWT_TOKEN`
4. Go to **Body** tab:
   - Select `form-data`
   - Add key: `avatar` (change type to **File**)
   - Choose your image file

**Response**:
```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v123456/profile_images/user123.jpg"
  }
}
```

---

### 2. Update Cover Image

**Endpoint**: `PATCH /api/users/me/cover-image`

**Access**: Private (Authenticated users)

**Content-Type**: `multipart/form-data`

**Form Data**:
- `coverImage`: Image file (jpg, jpeg, png, gif)

**Example Request (Postman)**:
1. Select `PATCH` method
2. Enter URL: `http://localhost:5001/api/users/me/cover-image`
3. Go to **Headers** tab:
   - Add `Authorization: Bearer YOUR_JWT_TOKEN`
4. Go to **Body** tab:
   - Select `form-data`
   - Add key: `coverImage` (change type to **File**)
   - Choose your image file

**Response**:
```json
{
  "success": true,
  "message": "Cover image updated successfully",
  "data": {
    "coverImage": "https://res.cloudinary.com/your-cloud/image/upload/v123456/cover_images/user123.jpg"
  }
}
```

---

### 3. Upload Book Cover (Authors)

**Endpoint**: `POST /api/books` or `PATCH /api/books/:bookId`

**Access**: Private (Authors only)

**Content-Type**: `multipart/form-data`

**Form Data** (for creating a book):
- `title`: String (required)
- `description`: String (required)
- `genre`: String (required)
- `image`: Image file (jpg, jpeg, png, gif)

**Example Request (Postman)**:
1. Select `POST` method
2. Enter URL: `http://localhost:5001/api/books`
3. Go to **Headers** tab:
   - Add `Authorization: Bearer YOUR_JWT_TOKEN`
4. Go to **Body** tab:
   - Select `form-data`
   - Add text fields: `title`, `description`, `genre`
   - Add key: `image` (change type to **File**)
   - Choose your book cover image

**Response**:
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "_id": "book123",
    "title": "My New Book",
    "description": "A great story...",
    "genre": "Fantasy",
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v123456/book_covers/book123.jpg",
    "author": "author123",
    "status": "draft"
  }
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Download Flow

1. **Login as Premium User**:
```
POST /api/auth/login
{ "email": "premium@user.com", "password": "password" }
```

2. **Check Download Stats**:
```
GET /api/downloads/stats
```

3. **Download a Book**:
```
GET /api/books/67890abcdef12345/download
```

4. **View Download History**:
```
GET /api/downloads/history
```

---

### Scenario 2: Complete Rating Flow

1. **Login**:
```
POST /api/auth/login
{ "email": "user@example.com", "password": "password" }
```

2. **Rate a Book**:
```
POST /api/books/67890abcdef12345/rate
{ "rating": 5 }
```

3. **Check Your Rating**:
```
GET /api/books/67890abcdef12345/rating/me
```

4. **View All Ratings**:
```
GET /api/books/67890abcdef12345/ratings
```

5. **Update Rating**:
```
POST /api/books/67890abcdef12345/rate
{ "rating": 4 }
```

6. **Delete Rating**:
```
DELETE /api/books/67890abcdef12345/rate
```

---

### Scenario 3: Cloudinary Upload Flow

1. **Login**:
```
POST /api/auth/login
{ "email": "user@example.com", "password": "password" }
```

2. **Upload Profile Image**:
```
PATCH /api/users/me/profile-image
Form-data: avatar = [image file]
```

3. **Upload Cover Image**:
```
PATCH /api/users/me/cover-image
Form-data: coverImage = [image file]
```

4. **Verify in Cloudinary Dashboard**:
- Go to your Cloudinary dashboard
- Check `profile_images` and `cover_images` folders
- Images should be uploaded there

---

### Scenario 4: Analytics Flow

1. **Get Public Analytics** (No auth needed):
```
GET /api/analytics/public
```

2. **Verify Data Structure**:
- Check `topBooks` array has engagement data
- Check `topAuthors` array has totalLikes
- Verify download counts are included

---

## ✅ Success Criteria

### Download Feature
- ✅ PDF downloads successfully
- ✅ PDF has improved layout with better margins (50px)
- ✅ PDF has title page, table of contents, and chapters
- ✅ Page numbers appear on every page
- ✅ Watermark appears subtly at bottom
- ✅ Daily limit enforced (10 downloads)
- ✅ Premium subscription checked
- ✅ Authors can download their own books

### Rating Feature
- ✅ Can rate books (1-5 stars)
- ✅ Can update existing rating
- ✅ Can delete rating
- ✅ Average rating calculated correctly
- ✅ Can view all ratings with pagination
- ✅ Can check personal rating

### Analytics Feature
- ✅ Top books include totalLikes
- ✅ Top authors include totalLikes
- ✅ Engagement metrics included
- ✅ Download counts included
- ✅ Rating statistics included

### Cloudinary Upload
- ✅ Profile images upload to Cloudinary
- ✅ Cover images upload to Cloudinary
- ✅ Book covers upload to Cloudinary
- ✅ Images accessible via Cloudinary URL
- ✅ Images persist in Cloudinary storage

---

## 🚨 Common Issues & Solutions

### Issue 1: "Premium subscription required"
**Solution**: Login with a premium user account or upgrade subscription:
```
POST /api/subscriptions/subscribe
{ "plan": "premium" }
```

### Issue 2: "Download limit reached"
**Solution**: Wait until the next day (limits reset at midnight) or test with a different user account.

### Issue 3: PDF generation fails
**Solution**: 
- Ensure the book has chapters
- Check that chapters have content
- Verify the book is published

### Issue 4: Rating validation fails
**Solution**: Ensure rating is an integer between 1 and 5.

### Issue 5: Image upload fails
**Solution**: 
- Check Cloudinary credentials in `.env` file
- Ensure image file is valid (jpg, jpeg, png, gif)
- Check file size (max 5MB)

---

## 📝 Summary

All features are now implemented and ready for testing:

1. ✅ **Download Feature**: Professional PDF generation with improved layout
2. ✅ **Rating Feature**: Complete CRUD operations for book ratings
3. ✅ **Analytics Feature**: Enhanced with totalLikes and comprehensive engagement data
4. ✅ **Cloudinary Upload**: Profile, cover, and book images upload to cloud storage

**Server Status**: Running on `http://localhost:5001`

Happy Testing! 🚀

