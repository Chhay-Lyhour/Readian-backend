# Readian API Documentation

**Version:** 1.2.0  
**Base URL:** `http://localhost:5001/api` (Development)  
**Last Updated:** November 23, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Age Restriction System](#age-restriction-system)
6. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Books](#book-endpoints)
   - [Chapters](#chapter-endpoints)
   - [Ratings](#rating-endpoints)
   - [Likes](#like-endpoints)
   - [Subscriptions](#subscription-endpoints)
   - [Downloads](#download-endpoints)
   - [Analytics](#analytics-endpoints)
   - [Admin](#admin-endpoints)

---

## Overview

Readian is a digital book reading and publishing platform API that allows users to:
- Read and publish books with chapters
- Rate and like books
- Subscribe to premium content
- Download books as PDF (Premium feature)
- Access age-appropriate content

### Features
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Reader, Author, Admin)
- **Email verification** for new accounts
- **Subscription system** (Free, Basic, Premium)
  - Free/Basic: Access finished books only
  - Premium: Early access to ongoing books + premium content
- **Search and Filter** by title, tags, author, genre (all plans)
- **Book Status Access Control** (ongoing vs finished)
- **Age-based content filtering** (Kids: 0-17, Adult: 18+)
- **File upload** to Cloudinary for images
- **PDF generation** for book downloads
- **Pagination** on list endpoints
- **Comprehensive analytics**

---

## Authentication

### Token Types

1. **Access Token**
   - Short-lived (60 minutes)
   - Used for API requests
   - Sent in `Authorization` header

2. **Refresh Token**
   - Long-lived (14 days)
   - Used to obtain new access tokens
   - Stored securely by client

### Authorization Header

```
Authorization: Bearer <access_token>
```

### Token Refresh Flow

When access token expires:
1. Call `POST /api/auth/refresh-token` with refresh token
2. Receive new access token
3. Use new token for subsequent requests

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error message here",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `INVALID_TOKEN` | 401 | Token is invalid or malformed |
| `EMAIL_NOT_VERIFIED` | 403 | Email must be verified |
| `SUBSCRIPTION_REQUIRED` | 403 | Premium subscription required |
| `AGE_RESTRICTED` | 403 | User age restriction for adult content |
| `AGE_NOT_SET` | 403 | User must set age to access content |
| `BOOK_NOT_FOUND` | 404 | Book does not exist |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `VALIDATION_ERROR` | 400 | Request validation failed |

---

## Rate Limiting

- **100 requests per 15 minutes** per IP address
- Applies to all endpoints
- Rate limit headers included in response

---

## Age Restriction System

### Content Types

1. **Kids Content** (`contentType: "kids"`)
   - Accessible to all users (logged in or not)
   - Suitable for ages 0-17

2. **Adult Content** (`contentType: "adult"`)
   - Requires user login
   - Requires user age ≥ 18
   - Blocked for users under 18

### Age Verification

- Users must set their age in profile
- Age field: `0-150` years
- Books with `contentType: "adult"` are automatically filtered for underage users

### Endpoints Affected

All book-related read endpoints enforce age restrictions:
- `GET /api/books`
- `GET /api/books/:id`
- `GET /api/books/:id/chapters`
- `GET /api/books/:id/chapters/:chapterNumber`
- `POST /api/books/:id/like`
- `POST /api/books/:bookId/rate`
- `GET /api/books/:bookId/download`

---

## API Endpoints

### Authentication Endpoints

#### 1. Register

Create a new user account.

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "673d4e5f6g7h8i9j0k1l",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "AUTHOR",
      "email_verified": false,
      "plan": "free",
      "subscriptionStatus": "inactive"
    }
  }
}
```

#### 2. Verify Email

Verify email with code sent to email.

```http
POST /api/auth/verify-email
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in.",
  "data": {
    "user": {
      "_id": "673d4e5f6g7h8i9j0k1l",
      "email_verified": true
    }
  }
}
```

#### 3. Resend Verification Code

Resend email verification code.

```http
POST /api/auth/resend-verification
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification code resent successfully.",
  "data": null
}
```

#### 4. Login

Authenticate and receive tokens.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "673d4e5f6g7h8i9j0k1l",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "AUTHOR",
      "email_verified": true,
      "plan": "free",
      "subscriptionStatus": "inactive",
      "avatar": null,
      "coverImage": null,
      "bio": null,
      "age": null
    }
  }
}
```

#### 5. Refresh Token

Get new access token using refresh token.

```http
POST /api/auth/refresh-token
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 6. Get Current User

Get authenticated user's profile.

```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "user": {
      "_id": "673d4e5f6g7h8i9j0k1l",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "AUTHOR",
      "email_verified": true,
      "plan": "premium",
      "subscriptionStatus": "active",
      "subscriptionExpiresAt": "2025-12-20T00:00:00.000Z",
      "subscriptionDuration": 30,
      "avatar": "https://res.cloudinary.com/.../avatar.jpg",
      "coverImage": "https://res.cloudinary.com/.../cover.jpg",
      "bio": "Passionate writer and reader",
      "age": 25,
      "likedBooks": ["book_id_1", "book_id_2"]
    }
  }
}
```

#### 7. Logout

Logout and invalidate refresh token.

```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

#### 8. Logout All Devices

Invalidate all refresh tokens for user.

```http
POST /api/auth/logout-all-devices
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully.",
  "data": null
}
```

#### 9. Forgot Password

Request password reset code.

```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset code sent to your email.",
  "data": null
}
```

#### 10. Verify Password Reset Code

Verify the password reset code.

```http
POST /api/auth/verify-password-reset-code
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reset code verified successfully.",
  "data": null
}
```

#### 11. Reset Password

Reset password with verified code.

```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": null
}
```

#### 12. Change Password

Change password (requires authentication).

```http
POST /api/auth/change-password
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": null
}
```

---

### User Endpoints

#### 1. Update Profile

Update current user's profile information.

```http
PATCH /api/users/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Author of fantasy novels",
  "age": 28
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Your profile has been updated.",
  "data": {
    "_id": "673d4e5f6g7h8i9j0k1l",
    "name": "John Smith",
    "bio": "Author of fantasy novels",
    "age": 28
  }
}
```

#### 2. Update Profile Image

Upload and update profile avatar.

```http
PATCH /api/users/me/profile-image
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `avatar`: Image file (JPEG, PNG, WebP)

**Response (200):**
```json
{
  "success": true,
  "message": "Profile image updated successfully.",
  "data": {
    "_id": "673d4e5f6g7h8i9j0k1l",
    "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v123456/profile_images/avatar.jpg"
  }
}
```

#### 3. Update Cover Image

Upload and update profile cover image.

```http
PATCH /api/users/me/cover-image
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `coverImage`: Image file (JPEG, PNG, WebP)

**Response (200):**
```json
{
  "success": true,
  "message": "Cover image updated successfully.",
  "data": {
    "_id": "673d4e5f6g7h8i9j0k1l",
    "coverImage": "https://res.cloudinary.com/your-cloud/image/upload/v123456/cover_images/cover.jpg"
  }
}
```

#### 4. Become Author

Upgrade user role from READER to AUTHOR.

```http
POST /api/users/me/become-author
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Congratulations! You are now a Author.",
  "data": {
    "_id": "673d4e5f6g7h8i9j0k1l",
    "role": "AUTHOR"
  }
}
```

#### 5. Get My Books

Get all books created by current author (Author/Admin only).

```http
GET /api/users/me/books?page=1&limit=10&status=published
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (`draft` or `published`)

**Response (200):**
```json
{
  "success": true,
  "message": "Your books retrieved successfully.",
  "data": {
    "books": [
      {
        "_id": "book_id_1",
        "title": "My First Book",
        "author": "673d4e5f6g7h8i9j0k1l",
        "status": "published",
        "bookStatus": "ongoing",
        "isPremium": false,
        "contentType": "kids",
        "image": "https://res.cloudinary.com/.../cover.jpg",
        "genre": "Fantasy",
        "tags": "adventure, magic",
        "averageRating": 4.5,
        "totalRatings": 10,
        "likes": 25,
        "viewCount": 150,
        "downloadCount": 5,
        "totalChapters": 12,
        "createdAt": "2025-11-01T10:00:00.000Z",
        "updatedAt": "2025-11-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalBooks": 25,
      "hasMore": true
    }
  }
}
```

#### 6. Get Author Stats

Get statistics dashboard for current author (Author/Admin only).

```http
GET /api/users/me/author-stats
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Author stats retrieved successfully.",
  "data": {
    "stats": {
      "totalBooks": 25,
      "publishedBooks": 20,
      "draftBooks": 5,
      "totalLikes": 450,
      "totalViews": 5230,
      "totalChapters": 312
    }
  }
}
```

#### 7. Get Liked Books

Get all books liked by current user.

```http
GET /api/users/me/liked-books?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Liked books retrieved successfully.",
  "data": {
    "likedBooks": [
      {
        "_id": "book_id_1",
        "title": "Amazing Book",
        "author": {
          "_id": "author_id",
          "name": "Jane Author",
          "avatar": "https://res.cloudinary.com/.../avatar.jpg"
        },
        "image": "https://res.cloudinary.com/.../cover.jpg",
        "genre": "Science Fiction",
        "tags": "space, future",
        "isPremium": true,
        "contentType": "adult",
        "likes": 1250,
        "viewCount": 8500,
        "totalChapters": 24,
        "publishedDate": "2025-10-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalBooks": 15,
      "hasMore": true
    }
  }
}
```

#### 8. Get All Users (Admin Only)

Get list of all users.

```http
GET /api/users
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "All users retrieved successfully.",
  "data": [
    {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "AUTHOR",
      "email_verified": true,
      "plan": "premium",
      "subscriptionStatus": "active",
      "age": 25,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

#### 9. Get User by ID (Admin Only)

Get specific user details.

```http
GET /api/users/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "_id": "user_id_1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "AUTHOR",
    "email_verified": true,
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2025-12-20T00:00:00.000Z",
    "subscriptionDuration": 30,
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg",
    "bio": "Passionate writer",
    "age": 25,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-11-20T08:30:00.000Z"
  }
}
```

#### 10. Update User (Admin Only)

Update any user's information.

```http
PATCH /api/users/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "ADMIN",
  "email_verified": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "_id": "user_id_1",
    "name": "Updated Name",
    "role": "ADMIN",
    "email_verified": true
  }
}
```

#### 11. Delete User (Admin Only)

Delete a user account.

```http
DELETE /api/users/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully.",
  "data": {
    "message": "User deleted successfully."
  }
}
```

---

### Book Endpoints

#### 1. Get All Books

Get list of published books with pagination. Automatically filters based on user age and subscription plan.

```http
GET /api/books?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Automatic Filtering:**
- **Age-based**: Users under 18 see only kids content
- **Plan-based**: Free/Basic users see only finished books, Premium users see all books

**Response (200):**
```json
{
  "success": true,
  "message": "Books retrieved successfully.",
  "data": {
    "books": [
      {
        "_id": "book_id_1",
        "title": "Amazing Adventure",
        "author": "author_id",
        "image": "https://res.cloudinary.com/.../cover.jpg",
        "genre": "Adventure",
        "tags": "action, fantasy",
        "description": "An unforgettable journey through magical lands filled with wonder and danger. Follow our hero as they discover courage, friendship, and the true meaning of adventure.",
        "status": "published",
        "bookStatus": "ongoing",
        "isPremium": false,
        "contentType": "kids",
        "averageRating": 4.5,
        "totalRatings": 120,
        "likes": 450,
        "viewCount": 2500,
        "downloadCount": 50,
        "readingTime": "4 hours 30 minutes",
        "totalChapters": 15,
        "publishedDate": "2025-10-01T00:00:00.000Z",
        "createdAt": "2025-09-15T10:00:00.000Z",
        "updatedAt": "2025-11-01T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalBooks": 95,
      "hasMore": true
    }
  }
}
```

#### 2. Search and Filter Books

Search and filter books by title, tags, author name, and genre. **Book status access is automatically filtered based on subscription plan.**

```http
GET /api/books/search?title=adventure&genre=fiction&page=1&limit=10
```

**Query Parameters:**
- `title` (optional): Search by title (partial match, case-insensitive)
- `author` (optional): Search by author name (partial match, case-insensitive)
- `genre` (optional): Filter by genre (partial match, case-insensitive)
- `tags` (optional): Filter by tags (partial match, case-insensitive)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Books retrieved successfully.",
  "data": {
    "books": [
      {
        "_id": "book_id_1",
        "title": "Amazing Adventure",
        "author": {
          "_id": "author_id",
          "name": "Jane Author",
          "email": "jane@example.com",
          "avatar": "https://res.cloudinary.com/.../avatar.jpg"
        },
        "image": "https://res.cloudinary.com/.../cover.jpg",
        "genre": "Adventure Fiction",
        "tags": "action, fantasy, adventure",
        "description": "An unforgettable journey...",
        "status": "published",
        "bookStatus": "finished",
        "isPremium": false,
        "contentType": "kids",
        "averageRating": 4.5,
        "totalRatings": 120,
        "likes": 450,
        "viewCount": 2500,
        "downloadCount": 50,
        "readingTime": "4 hours 30 minutes",
        "totalChapters": 15,
        "publishedDate": "2025-10-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalBooks": 48,
      "hasMore": true
    }
  }
}
```

**Search Capabilities by Plan:**

| Feature | Free | Basic | Premium |
|---------|------|-------|---------|
| Search by title | ✅ | ✅ | ✅ |
| Search by tags | ✅ | ✅ | ✅ |
| Search by author | ✅ | ✅ | ✅ |
| Search by genre | ✅ | ✅ | ✅ |
| See finished books | ✅ | ✅ | ✅ |
| See ongoing books (early access) | ❌ | ❌ | ✅ |
| Access premium books | ❌ | ✅ | ✅ |

**Book Status Access Rules:**
- **Free & Basic Users**: Backend automatically filters to show only **finished/completed** books
- **Premium Users**: Can see both **ongoing** and **finished** books (early access to incomplete books)
- **Automatic Filtering**: No need to specify bookStatus in query - backend handles it based on user's plan
- **Premium Content**: Both Basic and Premium users can access books marked as premium (isPremium)

**Example Use Cases:**

1. Search for fantasy books:
```
GET /api/books/search?genre=fantasy&page=1&limit=20
```

2. Search by author name:
```
GET /api/books/search?author=Jane%20Smith
```

3. Search by title and tags:
```
GET /api/books/search?title=dragon&tags=adventure
```

**Notes:**
- All searches respect age restrictions (adult content requires login + age ≥ 18)
- Free/Basic users will only see finished books in search results
- Premium users see both ongoing and finished books
- Search is case-insensitive and supports partial matching

#### 3. Get Book by ID

Get detailed book information including chapters. Age restriction applies.

```http
GET /api/books/:id?chapterPage=1&chapterLimit=10
```

**Query Parameters:**
- `chapterPage` (optional): Chapter page number (default: 1)
- `chapterLimit` (optional): Chapters per page (default: 10, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Book retrieved successfully.",
  "data": {
    "_id": "book_id_1",
    "title": "Amazing Adventure",
    "author": "author_id",
    "image": "https://res.cloudinary.com/.../cover.jpg",
    "genre": "Adventure",
    "tags": "action, fantasy",
    "description": "An unforgettable journey through magical lands filled with wonder and danger. Follow our hero as they discover courage, friendship, and the true meaning of adventure.",
    "status": "published",
    "bookStatus": "ongoing",
    "isPremium": false,
    "contentType": "kids",
    "averageRating": 4.5,
    "totalRatings": 120,
    "likes": 450,
    "likedBy": ["user_id_1", "user_id_2"],
    "viewCount": 2501,
    "downloadCount": 50,
    "allowDownload": true,
    "readingTime": "4 hours 30 minutes",
    "publishedDate": "2025-10-01T00:00:00.000Z",
    "chapters": [
      {
        "_id": "chapter_id_1",
        "book": "book_id_1",
        "chapterNumber": 1,
        "title": "The Beginning",
        "content": "Once upon a time...",
        "createdAt": "2025-09-15T10:00:00.000Z",
        "updatedAt": "2025-09-15T10:00:00.000Z"
      }
    ],
    "tableOfContents": [
      "The Beginning",
      "The Journey",
      "The Challenge"
    ],
    "chapterPagination": {
      "totalPages": 2,
      "currentPage": 1,
      "totalChapters": 15
    },
    "createdAt": "2025-09-15T10:00:00.000Z",
    "updatedAt": "2025-11-01T14:20:00.000Z"
  }
}
```

**Error Responses:**
- `403 AGE_RESTRICTED`: User under 18 trying to access adult content
- `403 AGE_NOT_SET`: User hasn't set age for adult content
- `403 SUBSCRIPTION_REQUIRED`: Premium book requires subscription

#### 4. Create Book

Create a new book with chapters (Author/Admin only).

```http
POST /api/books
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title`: Book title (required)
- `genre`: Book genre (optional)
- `tags`: Comma-separated tags (optional)
- `description`: Book description to entice readers, 10-1000 characters (optional)
- `isPremium`: Boolean (optional, default: false)
- `contentType`: "kids" or "adult" (default: "kids")
- `image`: Cover image file (optional)
- `chapters`: JSON string array of chapters (required)

**Chapters JSON Format:**
```json
[
  {
    "title": "Chapter 1: The Beginning",
    "content": "Once upon a time in a far away land..."
  },
  {
    "title": "Chapter 2: The Journey",
    "content": "The hero set out on an epic journey..."
  }
]
```

**Response (201):**
```json
{
  "success": true,
  "message": "Book created successfully.",
  "data": {
    "_id": "book_id_1",
    "title": "My New Book",
    "author": "author_id",
    "genre": "Fantasy",
    "tags": "magic, adventure",
    "description": "A spellbinding tale of magic and mystery that will captivate readers from the very first page.",
    "status": "draft",
    "bookStatus": "ongoing",
    "isPremium": false,
    "contentType": "kids",
    "image": "https://res.cloudinary.com/.../cover.jpg",
    "readingTime": "3 hours 15 minutes",
    "createdAt": "2025-11-20T10:00:00.000Z"
  }
}
```

#### 5. Update Book

Update book information and/or chapters (Author/Admin only).

```http
PATCH /api/books/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title`: Book title (optional)
- `genre`: Book genre (optional)
- `tags`: Comma-separated tags (optional)
- `description`: Book description to entice readers, 10-1000 characters (optional)
- `isPremium`: Boolean (optional)
- `contentType`: "kids" or "adult" (optional)
- `bookStatus`: "ongoing" or "finished" (optional)
- `image`: New cover image file (optional)
- `chapters`: JSON string array of chapters (optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Book updated successfully.",
  "data": {
    "_id": "book_id_1",
    "title": "Updated Title",
    "updatedAt": "2025-11-20T14:30:00.000Z"
  }
}
```

#### 6. Delete Book

Delete a book and all its chapters (Author/Admin only).

```http
DELETE /api/books/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book deleted successfully.",
  "data": {
    "message": "Book deleted successfully."
  }
}
```

#### 7. Publish Book

Change book status from draft to published (Author/Admin only).

```http
POST /api/books/:id/publish
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book published successfully.",
  "data": {
    "_id": "book_id_1",
    "status": "published",
    "publishedDate": "2025-11-20T15:00:00.000Z"
  }
}
```

#### 8. Toggle Premium Status

Toggle book between free and premium (Author/Admin only).

```http
POST /api/books/:id/toggle-premium
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book marked as premium.",
  "data": {
    "_id": "book_id_1",
    "isPremium": true
  }
}
```

#### 9. Update Book Status

Update book completion status (Author/Admin only).

```http
PATCH /api/books/:id/status
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "bookStatus": "finished"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book status updated successfully.",
  "data": {
    "_id": "book_id_1",
    "bookStatus": "finished"
  }
}
```

---

#### 8. Update Book Content Type

Update the age-appropriateness of a book. Only the book's author or an admin can update the content type.

```http
PATCH /api/books/:id/content-type
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "contentType": "adult"
}
```

**Allowed Values:**
- `"kids"` - Suitable for ages 0-17
- `"adult"` - Suitable for ages 18+

**Response (200):**
```json
{
  "success": true,
  "message": "Book content type updated to 'adult'.",
  "data": {
    "_id": "book_id_1",
    "title": "Example Book",
    "contentType": "adult",
    "author": "author_id_1",
    "status": "published",
    "createdAt": "2025-09-15T10:00:00.000Z",
    "updatedAt": "2025-11-21T10:00:00.000Z"
  }
}
```

**Error Responses:**

**404 - Book Not Found:**
```json
{
  "success": false,
  "message": "The requested book could not be found.",
  "error": {
    "code": "BOOK_NOT_FOUND",
    "statusCode": 404
  }
}
```

**403 - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action.",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "statusCode": 403
  }
}
```

**400 - Invalid Content Type:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "contentType",
        "message": "Content type must be 'kids' or 'adult'"
      }
    ]
  }
}
```

**Notes:**
- Only the book's author or an admin can update the content type
- Changing a book to "adult" will immediately restrict access to users under 18
- Changing a book to "kids" will make it accessible to all users
- This is useful when content guidelines change or content is revised

---

### Chapter Endpoints

#### 1. Get Book Chapters

Get all chapters for a book with pagination. Age restriction applies.

```http
GET /api/books/:id/chapters?chapterPage=1&chapterLimit=10
```

**Query Parameters:**
- `chapterPage` (optional): Page number (default: 1)
- `chapterLimit` (optional): Items per page (default: 10, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Chapters retrieved successfully.",
  "data": {
    "bookId": "book_id_1",
    "bookTitle": "Amazing Adventure",
    "chapters": [
      {
        "_id": "chapter_id_1",
        "book": "book_id_1",
        "chapterNumber": 1,
        "title": "The Beginning",
        "content": "Once upon a time...",
        "createdAt": "2025-09-15T10:00:00.000Z",
        "updatedAt": "2025-09-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "totalPages": 2,
      "currentPage": 1,
      "totalChapters": 15
    }
  }
}
```

#### 2. Get Chapter by Number

Get specific chapter content. Age restriction applies.

```http
GET /api/books/:id/chapters/:chapterNumber
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chapter retrieved successfully.",
  "data": {
    "_id": "chapter_id_1",
    "book": "book_id_1",
    "chapterNumber": 1,
    "title": "The Beginning",
    "content": "Once upon a time in a far away land...",
    "createdAt": "2025-09-15T10:00:00.000Z",
    "updatedAt": "2025-09-15T10:00:00.000Z"
  }
}
```

#### 3. Add Chapter

Add a new chapter to a book (Author/Admin only).

```http
POST /api/books/:bookId/chapters
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "New Chapter Title",
  "content": "Chapter content goes here..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Chapter added successfully.",
  "data": {
    "_id": "chapter_id_new",
    "book": "book_id_1",
    "chapterNumber": 16,
    "title": "New Chapter Title",
    "content": "Chapter content goes here...",
    "createdAt": "2025-11-20T16:00:00.000Z"
  }
}
```

#### 4. Update Chapter

Update chapter content (Author/Admin only).

```http
PATCH /api/books/:bookId/chapters/:chapterNumber
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Updated Chapter Title",
  "content": "Updated chapter content..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chapter updated successfully.",
  "data": {
    "_id": "chapter_id_1",
    "chapterNumber": 1,
    "title": "Updated Chapter Title",
    "content": "Updated chapter content...",
    "updatedAt": "2025-11-20T16:30:00.000Z"
  }
}
```

#### 5. Delete Chapter

Delete a chapter (Author/Admin only).

```http
DELETE /api/books/:bookId/chapters/:chapterNumber
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chapter deleted and remaining chapters renumbered successfully.",
  "data": {
    "message": "Chapter deleted and remaining chapters renumbered successfully."
  }
}
```

#### 6. Reorder Chapters

Reorder chapters in a book (Author/Admin only).

```http
POST /api/books/:bookId/chapters/reorder
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "chapterOrder": [3, 1, 2, 4, 5]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chapters reordered successfully.",
  "data": {
    "message": "Chapters reordered successfully."
  }
}
```

---

### Rating Endpoints

#### 1. Rate a Book

Add or update rating for a book (1-5 stars). Age restriction applies.

```http
POST /api/books/:bookId/rate
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "rating": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book rated successfully.",
  "data": {
    "book": {
      "_id": "book_id_1",
      "averageRating": 4.7,
      "totalRatings": 121
    },
    "userRating": {
      "user": "user_id",
      "rating": 5,
      "createdAt": "2025-11-20T17:00:00.000Z"
    }
  }
}
```

#### 2. Get My Rating

Get current user's rating for a book. Age restriction applies.

```http
GET /api/books/:bookId/rating/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Your rating retrieved successfully.",
  "data": {
    "rating": 5,
    "createdAt": "2025-11-20T17:00:00.000Z"
  }
}
```

#### 3. Delete Rating

Remove user's rating from a book. Age restriction applies.

```http
DELETE /api/books/:bookId/rate
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Rating deleted successfully.",
  "data": {
    "book": {
      "_id": "book_id_1",
      "averageRating": 4.6,
      "totalRatings": 120
    }
  }
}
```

#### 4. Get Book Ratings

Get all ratings for a book (paginated, public).

```http
GET /api/books/:bookId/ratings?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Ratings retrieved successfully.",
  "data": {
    "ratings": [
      {
        "user": {
          "_id": "user_id_1",
          "name": "John Doe",
          "avatar": "https://res.cloudinary.com/.../avatar.jpg"
        },
        "rating": 5,
        "createdAt": "2025-11-20T17:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 12,
      "totalRatings": 120,
      "hasMore": true
    },
    "bookInfo": {
      "averageRating": 4.6,
      "totalRatings": 120
    }
  }
}
```

---

### Like Endpoints

#### 1. Like a Book

Add book to user's liked books. Age restriction applies.

```http
POST /api/books/:id/like
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book liked successfully.",
  "data": {
    "book": {
      "_id": "book_id_1",
      "likes": 451
    }
  }
}
```

#### 2. Unlike a Book

Remove book from user's liked books. Age restriction applies.

```http
POST /api/books/:id/unlike
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book unliked successfully.",
  "data": {
    "book": {
      "_id": "book_id_1",
      "likes": 450
    }
  }
}
```

---

### Subscription Endpoints

#### 1. Subscribe/Upgrade Plan

Activate or upgrade subscription plan.

```http
POST /api/subscriptions/activate
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "plan": "premium",
  "duration": 30
}
```

**Plans:**
- `free`: Free plan
- `basic`: Basic plan ($4.99/month)
- `premium`: Premium plan ($9.99/month)

**Duration:**
- Number of days for the subscription period
- Minimum: 1 day
- Maximum: 3650 days (10 years)
- Default: 30 days (if not specified)
- Common values: 30 (monthly), 90 (quarterly), 365 (yearly)

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription activated successfully for the premium plan (30 days).",
  "data": {
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2025-12-23T17:30:00.000Z",
    "subscriptionDuration": 30
  }
}
```

**Example Usage:**

Monthly subscription:
```json
{
  "plan": "premium",
  "duration": 30
}
```

Quarterly subscription:
```json
{
  "plan": "premium",
  "duration": 90
}
```

Yearly subscription:
```json
{
  "plan": "premium",
  "duration": 365
}
```

#### 2. Get Subscription Status

Get current user's subscription details.

```http
GET /api/subscriptions/status
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription status retrieved.",
  "data": {
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2025-12-20T17:30:00.000Z",
    "subscriptionDuration": 30
  }
}
```

---

### Download Endpoints

#### 1. Download Book as PDF

Download book with all chapters as PDF. Requires Premium subscription or book ownership. Age restriction applies.

```http
GET /api/books/:bookId/download
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Book-Title.pdf"`
- Binary PDF file

**PDF Features:**
- Professional formatting
- Table of contents with page numbers
- All chapters with proper pagination
- Book metadata (title, author, published date)

**Error Responses:**
- `403 SUBSCRIPTION_REQUIRED`: Premium subscription required
- `403 AGE_RESTRICTED`: User under 18 for adult content
- `403 DOWNLOAD_NOT_ALLOWED`: Book doesn't allow downloads

#### 2. Get Download History

Get user's download history.

```http
GET /api/downloads/history?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Download history retrieved successfully.",
  "data": {
    "downloads": [
      {
        "_id": "download_id_1",
        "book": {
          "_id": "book_id_1",
          "title": "Amazing Adventure",
          "image": "https://res.cloudinary.com/.../cover.jpg"
        },
        "downloadedAt": "2025-11-20T18:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalDownloads": 15,
      "hasMore": true
    }
  }
}
```

#### 3. Get Download Stats

Get download statistics for current user.

```http
GET /api/downloads/stats
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Download stats retrieved successfully.",
  "data": {
    "totalDownloads": 15,
    "downloadedBooks": 12,
    "recentDownloads": 3
  }
}
```

#### 4. Get Author Download Analytics

Get download analytics for author's books (Author only).

```http
GET /api/author/downloads/analytics
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Download analytics retrieved successfully.",
  "data": {
    "totalDownloads": 450,
    "downloadsByBook": [
      {
        "book": {
          "_id": "book_id_1",
          "title": "Popular Book"
        },
        "downloadCount": 150
      }
    ],
    "recentDownloads": [
      {
        "book": "book_id_1",
        "user": "user_id",
        "downloadedAt": "2025-11-20T18:00:00.000Z"
      }
    ]
  }
}
```

---

### Analytics Endpoints

#### 1. Get Public Analytics

Get platform-wide public statistics (no authentication required).

```http
GET /api/analytics/public
```

**Response (200):**
```json
{
  "success": true,
  "message": "Public analytics retrieved successfully.",
  "data": {
    "topBooks": [
      {
        "_id": "book_id_1",
        "title": "Most Popular Book",
        "description": "An engaging story that captivates readers...",
        "author": {
          "_id": "author_id",
          "name": "Famous Author",
          "avatar": "https://res.cloudinary.com/.../avatar.jpg"
        },
        "image": "https://res.cloudinary.com/.../cover.jpg",
        "genre": "Fiction",
        "isPremium": false,
        "publishedDate": "2025-01-15T00:00:00.000Z",
        "viewCount": 15000,
        "totalLikes": 2500,
        "averageRating": 4.8,
        "totalRatings": 450,
        "downloadCount": 380,
        "engagement": {
          "views": 15000,
          "likes": 2500,
          "ratings": 450,
          "downloads": 380
        }
      }
    ],
    "topAuthors": [
      {
        "authorId": "author_id",
        "authorName": "Top Author",
        "authorEmail": "author@example.com",
        "authorAvatar": "https://res.cloudinary.com/.../avatar.jpg",
        "totalViews": 45000,
        "totalLikes": 8500,
        "totalRatings": 1200,
        "totalDownloads": 3400,
        "averageRating": 4.6,
        "bookCount": 25,
        "engagement": {
          "views": 45000,
          "likes": 8500,
          "ratings": 1200,
          "downloads": 3400
        }
      }
    ]
  }
}
```

**Key Metrics Explained:**

For **Top Books**:
- `totalLikes`: Number of users who liked this book
- `viewCount`: Total number of views
- `averageRating`: Average rating (1-5 stars)
- `totalRatings`: Number of ratings received
- `downloadCount`: Number of times downloaded

For **Top Authors**:
- `totalLikes`: Combined likes across all author's books
- `totalViews`: Combined views across all author's books
- `averageRating`: Average rating across all author's books
- `bookCount`: Number of published books
- `totalDownloads`: Combined downloads across all books

---

### Admin Endpoints

#### 1. Get All Users

See "User Endpoints > Get All Users" above.

#### 2. Get User by ID

See "User Endpoints > Get User by ID" above.

#### 3. Update User

See "User Endpoints > Update User" above.

#### 4. Delete User

See "User Endpoints > Delete User" above.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful message",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Notes

1. **Authentication**: Most endpoints require authentication. Include `Authorization: Bearer <token>` header.

2. **Age Restriction**: Books with `contentType: "adult"` require:
   - User must be logged in
   - User must have `age` field set
   - User must be 18 or older

3. **Premium Features**:
   - Download books as PDF
   - Advanced search filters (genre, tags)
   - Sort by likes
   - Access premium books

4. **File Uploads**: Use `multipart/form-data` for image uploads (max 5MB).

5. **Pagination**: Default page=1, limit=10. Max limit=100.

6. **Cloudinary**: Images are stored on Cloudinary CDN.

7. **Rate Limiting**: 100 requests per 15 minutes per IP.

---

## Support

For issues or questions, contact the development team.

**API Version:** 1.0.0  
**Last Updated:** November 20, 2025

