# Readian Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Books](#book-endpoints)
   - [Chapters](#chapter-endpoints)
   - [Subscriptions](#subscription-endpoints)
   - [Analytics](#analytics-endpoints)
   - [Admin](#admin-endpoints)
6. [Error Handling](#error-handling)
7. [File Uploads](#file-uploads)
8. [Environment Variables](#environment-variables)

---

## Overview

**Readian** is a book publishing and reading platform backend built with Node.js, Express, and MongoDB. The platform supports:
- User authentication with email verification
- Role-based access control (READER, AUTHOR, ADMIN)
- Book publishing with chapters
- Premium content with subscription management
- Like/Unlike functionality
- File uploads for book covers and profile images
- Analytics and statistics

**Base URL**: `http://localhost:5001/api`

**Tech Stack**:
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Zod for validation
- Bcrypt for password hashing
- Local file storage for images (optional Cloudinary integration)

---

## Architecture

### Project Structure
```
src/
├── app.js                      # Express app configuration
├── server.js                   # Server startup
├── config/                     # Configuration files
├── controllers/                # Request handlers
├── dto/                        # Validation schemas (Zod)
├── middlewares/                # Custom middlewares
├── models/                     # MongoDB schemas
├── routes/                     # API route definitions
├── services/                   # Business logic
├── repositories/               # Database operations
└── utils/                      # Helper functions
```

### Key Features
- **Layered Architecture**: Controllers → Services → Repositories
- **Validation**: All inputs validated using Zod schemas
- **Error Handling**: Centralized error handling middleware
- **Security**: Helmet, CORS, rate limiting, JWT tokens
- **File Management**: Local uploads with organized directory structure

---

## Authentication & Authorization

### Authentication Flow
1. User registers with email and password
2. Verification code sent to email (6-digit code)
3. User verifies email with code
4. User can login and receive access + refresh tokens
5. Access token expires in 15 minutes, refresh token in 14 days

### Token Types
- **Access Token**: Short-lived JWT for API requests (15 min)
- **Refresh Token**: Long-lived token to get new access tokens (14 days)

### Authorization Headers
```
Authorization: Bearer <access_token>
```

### User Roles
- **READER**: Can read free books, like books, subscribe to premium
- **AUTHOR**: Can create, edit, publish books and chapters
- **ADMIN**: Full access to all features including user management

### Middleware Types
- `requireAuth`: Validates JWT and attaches user to request
- `softAuth`: Optional authentication (for public/premium content)
- `requireRole(['AUTHOR', 'ADMIN'])`: Role-based access control

---

## Data Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: Enum ['READER', 'AUTHOR', 'ADMIN'] (default: 'AUTHOR'),
  email_verified: Boolean (default: false),
  last_login: Date,
  avatar: String (URL),
  bio: String (max 500 chars),
  
  // Subscription fields
  plan: Enum ['free', 'basic', 'premium'] (default: 'free'),
  subscriptionStatus: Enum ['active', 'inactive'] (default: 'inactive'),
  subscriptionExpiresAt: Date,
  
  // Relations
  likedBooks: [ObjectId] (ref: Book),
  
  timestamps: true (createdAt, updatedAt)
}
```

### Book Model
```javascript
{
  title: String (required),
  readingTime: String,
  author: ObjectId (ref: User, required),
  tags: String,
  genre: String,
  rating: Number (0-5),
  image: String (URL),
  
  // Status fields
  status: Enum ['draft', 'published'] (default: 'draft'),
  bookStatus: Enum ['ongoing', 'finished'] (default: 'ongoing'),
  isPremium: Boolean,
  publishedDate: Date,
  
  // Engagement metrics
  viewCount: Number (default: 0),
  likes: Number (default: 0),
  likedBy: [ObjectId] (ref: User),
  
  timestamps: true
}
```

### Chapter Model
```javascript
{
  title: String (required),
  content: String (required),
  book: ObjectId (ref: Book, required),
  chapterNumber: Number (required),
  
  timestamps: true
}
// Unique index on: {book, chapterNumber}
```

### Email Verification Model
```javascript
{
  email: String (required),
  code: String (required, 6 digits),
  expiresAt: Date (required),
  createdAt: Date (default: now)
}
```

### Refresh Token Model
```javascript
{
  userId: ObjectId (ref: User, required),
  token: String (required, unique),
  expiresAt: Date (required),
  createdAt: Date (default: now)
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user and send verification email.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Validation**:
- Email: Valid email format, lowercase
- Password: Min 8 chars, 1 uppercase, 1 number
- Name: Min 2 characters

**Response**: 201 Created
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "AUTHOR",
      "email_verified": false
    }
  }
}
```

---

#### POST `/api/auth/verify-email`
Verify email address with 6-digit code.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {}
}
```

---

#### POST `/api/auth/resend-verification`
Resend verification code to email.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "data": {}
}
```

---

#### POST `/api/auth/login`
Login with email and password.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "AUTHOR",
      "email_verified": true,
      "avatar": "/uploads/profile_images/avatar.jpg",
      "bio": "Author bio",
      "plan": "free",
      "subscriptionStatus": "inactive"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### GET `/api/auth/me`
Get current authenticated user.

**Access**: Protected (requires access token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "AUTHOR",
      "avatar": "/uploads/profile_images/avatar.jpg"
    }
  }
}
```

---

#### POST `/api/auth/refresh-token`
Get new access token using refresh token.

**Access**: Protected

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### POST `/api/auth/logout`
Logout and invalidate refresh token.

**Access**: Protected

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

---

#### POST `/api/auth/logout-all-devices`
Logout from all devices (invalidate all refresh tokens).

**Access**: Protected

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Logged out from all devices",
  "data": {}
}
```

---

#### POST `/api/auth/forgot-password`
Request password reset code.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Password reset code sent to email",
  "data": {}
}
```

---

#### POST `/api/auth/verify-password-reset-code`
Verify the password reset code.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Reset code verified",
  "data": {}
}
```

---

#### POST `/api/auth/reset-password`
Reset password with verified code.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {}
}
```

---

#### POST `/api/auth/change-password`
Change password (when logged in).

**Access**: Protected

**Request Body**:
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePass123"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {}
}
```

---

### User Endpoints

#### PATCH `/api/users/me`
Update current user's profile.

**Access**: Protected

**Request Body**:
```json
{
  "name": "Jane Doe",
  "bio": "I love writing fantasy novels"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Doe",
      "bio": "I love writing fantasy novels",
      "email": "user@example.com"
    }
  }
}
```

---

#### PATCH `/api/users/me/profile-image`
Update profile image.

**Access**: Protected

**Request**: Multipart form-data
```
avatar: <image_file>
```

**Supported formats**: JPG, JPEG, PNG, GIF, WebP
**Max size**: 5MB

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "avatar": "/uploads/profile_images/1234567890-avatar.jpg"
  }
}
```

---

#### POST `/api/users/me/become-author`
Upgrade from READER to AUTHOR role.

**Access**: Protected (READER only)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Role upgraded to AUTHOR",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "role": "AUTHOR"
    }
  }
}
```

---

#### GET `/api/users/me/books`
Get all books created by the current author (including drafts).

**Access**: Protected (AUTHOR or ADMIN)

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": {
    "books": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "My Fantasy Novel",
        "genre": "Fantasy",
        "status": "published",
        "bookStatus": "ongoing",
        "isPremium": false,
        "image": "/uploads/book_covers/cover.jpg",
        "likes": 42,
        "viewCount": 1520,
        "totalChapters": 15,
        "publishedDate": "2025-01-01T00:00:00.000Z",
        "createdAt": "2024-12-01T00:00:00.000Z"
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

---

#### GET `/api/users/me/author-stats`
Get statistics for the current author.

**Access**: Protected (AUTHOR or ADMIN)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Author stats retrieved successfully",
  "data": {
    "stats": {
      "totalBooks": 5,
      "publishedBooks": 3,
      "draftBooks": 2,
      "totalLikes": 234,
      "totalViews": 15420,
      "totalChapters": 87
    }
  }
}
```

---

#### GET `/api/users/me/liked-books`
Get all books liked by the current user.

**Access**: Protected

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Liked books retrieved successfully",
  "data": {
    "likedBooks": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Amazing Book",
        "author": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Author Name"
        },
        "genre": "Sci-Fi",
        "image": "/uploads/book_covers/cover.jpg",
        "likes": 1234,
        "totalChapters": 20
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

---

#### GET `/api/users` (Admin Only)
Get all users.

**Access**: Protected (ADMIN only)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "user@example.com",
        "role": "AUTHOR",
        "email_verified": true,
        "plan": "premium",
        "subscriptionStatus": "active"
      }
    ]
  }
}
```

---

#### GET `/api/users/:id` (Admin Only)
Get user by ID.

**Access**: Protected (ADMIN only)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "AUTHOR"
    }
  }
}
```

---

#### PATCH `/api/users/:id` (Admin Only)
Update user by ID.

**Access**: Protected (ADMIN only)

**Request Body**:
```json
{
  "name": "Updated Name",
  "role": "ADMIN",
  "email_verified": true
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Updated Name",
      "role": "ADMIN"
    }
  }
}
```

---

#### DELETE `/api/users/:id` (Admin Only)
Delete user by ID.

**Access**: Protected (ADMIN only)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {}
}
```

---

### Book Endpoints

#### GET `/api/books`
Get all published books (paginated).

**Access**: Public

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": {
    "books": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Amazing Fantasy Novel",
        "author": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Author Name",
          "avatar": "/uploads/profile_images/avatar.jpg"
        },
        "genre": "Fantasy",
        "tags": "magic, adventure",
        "image": "/uploads/book_covers/cover.jpg",
        "status": "published",
        "bookStatus": "ongoing",
        "isPremium": false,
        "likes": 234,
        "viewCount": 5420,
        "totalChapters": 25,
        "publishedDate": "2025-01-01T00:00:00.000Z",
        "createdAt": "2024-12-01T00:00:00.000Z"
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

---

#### GET `/api/books/search`
Search books by title, author, genre, or tags.

**Access**: Public (soft authentication for premium filtering)

**Query Parameters**:
- `title`: Search by title (partial match)
- `author`: Search by author name (partial match)
- `genre`: Filter by genre
- `tags`: Filter by tags
- `sortByLikes`: Sort by likes ('asc' or 'desc')
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Example**: `/api/books/search?title=fantasy&genre=Fantasy&sortByLikes=desc&page=1&limit=20`

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Books found",
  "data": {
    "books": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Fantasy Adventure",
        "author": {
          "name": "Author Name"
        },
        "genre": "Fantasy",
        "likes": 500
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

---

#### GET `/api/books/:id`
Get book details by ID (with chapters).

**Access**: Public (soft auth - premium books require subscription)

**Query Parameters**:
- `chapterPage` (default: 1)
- `chapterLimit` (default: 10, max: 100)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book retrieved successfully",
  "data": {
    "book": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Amazing Fantasy Novel",
      "author": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Author Name",
        "avatar": "/uploads/profile_images/avatar.jpg",
        "bio": "Fantasy author"
      },
      "genre": "Fantasy",
      "tags": "magic, adventure",
      "image": "/uploads/book_covers/cover.jpg",
      "status": "published",
      "bookStatus": "ongoing",
      "isPremium": false,
      "likes": 234,
      "viewCount": 5421,
      "totalChapters": 25,
      "isLikedByUser": false,
      "publishedDate": "2025-01-01T00:00:00.000Z",
      "chapters": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "title": "Chapter 1: The Beginning",
          "chapterNumber": 1,
          "createdAt": "2024-12-01T00:00:00.000Z"
        }
      ],
      "chapterPagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalChapters": 25,
        "hasMore": true
      }
    }
  }
}
```

**Note**: If book is premium and user is not subscribed or not logged in:
```json
{
  "success": false,
  "message": "This book is premium. Please subscribe to access.",
  "error": {
    "statusCode": 403,
    "isPremium": true
  }
}
```

---

#### POST `/api/books`
Create a new book with chapters.

**Access**: Protected (AUTHOR or ADMIN)

**Request**: Multipart form-data
```
title: "My New Book"
genre: "Fantasy"
tags: "magic, adventure"
isPremium: false
image: <image_file>
chapters: [{"title": "Chapter 1", "content": "Chapter content..."}]
```

**Request Body** (JSON):
```json
{
  "title": "My New Book",
  "genre": "Fantasy",
  "tags": "magic, adventure",
  "isPremium": false,
  "chapters": [
    {
      "title": "Chapter 1: The Beginning",
      "content": "Once upon a time..."
    }
  ]
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "book": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "My New Book",
      "author": "507f1f77bcf86cd799439013",
      "genre": "Fantasy",
      "status": "draft",
      "bookStatus": "ongoing",
      "isPremium": false,
      "readingTime": "15 min read",
      "image": "/uploads/book_covers/1234567890-cover.jpg",
      "totalChapters": 1
    }
  }
}
```

**Note**: The `readingTime` field is automatically calculated based on the total content of all chapters (225 words per minute reading speed). It updates automatically when chapters are added, updated, or deleted.

---

#### PATCH `/api/books/:id`
Update book details.

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Request**: Multipart form-data (optional image)
```json
{
  "title": "Updated Title",
  "genre": "Sci-Fi",
  "bookStatus": "finished"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "book": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Updated Title",
      "genre": "Sci-Fi",
      "bookStatus": "finished"
    }
  }
}
```

---

#### DELETE `/api/books/:id`
Delete a book and all its chapters.

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": {}
}
```

---

#### POST `/api/books/:id/publish`
Publish a draft book.

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book published successfully",
  "data": {
    "book": {
      "_id": "507f1f77bcf86cd799439012",
      "status": "published",
      "publishedDate": "2025-11-19T10:30:00.000Z"
    }
  }
}
```

---

#### POST `/api/books/:id/toggle-premium`
Toggle premium status of a book (free ↔ premium).

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Premium status toggled successfully",
  "data": {
    "book": {
      "_id": "507f1f77bcf86cd799439012",
      "isPremium": true
    }
  }
}
```

---

#### PATCH `/api/books/:id/status`
Update book status (ongoing/finished).

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Request Body**:
```json
{
  "bookStatus": "finished"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book status updated successfully",
  "data": {
    "book": {
      "_id": "507f1f77bcf86cd799439012",
      "bookStatus": "finished"
    }
  }
}
```

---

#### POST `/api/books/:id/like`
Like a book.

**Access**: Protected

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book liked successfully",
  "data": {
    "likes": 235,
    "isLiked": true
  }
}
```

**Note**: If already liked, returns 400 error.

---

#### POST `/api/books/:id/unlike`
Unlike a book.

**Access**: Protected

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book unliked successfully",
  "data": {
    "likes": 234,
    "isLiked": false
  }
}
```

---

### Chapter Endpoints

#### GET `/api/books/:id/chapters`
Get all chapters for a book (paginated).

**Access**: Public (soft auth - premium books require subscription)

**Query Parameters**:
- `chapterPage` (default: 1)
- `chapterLimit` (default: 10, max: 100)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Chapters retrieved successfully",
  "data": {
    "chapters": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "title": "Chapter 1: The Beginning",
        "chapterNumber": 1,
        "createdAt": "2024-12-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalChapters": 25,
      "hasMore": true
    }
  }
}
```

---

#### GET `/api/books/:id/chapters/:chapterNumber`
Get a specific chapter by number.

**Access**: Public (soft auth - premium books require subscription)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Chapter retrieved successfully",
  "data": {
    "chapter": {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Chapter 1: The Beginning",
      "content": "Once upon a time in a magical land...",
      "chapterNumber": 1,
      "book": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Amazing Fantasy Novel",
        "author": {
          "name": "Author Name"
        }
      },
      "createdAt": "2024-12-01T00:00:00.000Z"
    }
  }
}
```

---

#### POST `/api/books/:bookId/chapters`
Add a new chapter to a book.

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Request Body**:
```json
{
  "title": "Chapter 5: The Climax",
  "content": "The hero finally faces the villain..."
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Chapter added successfully",
  "data": {
    "chapter": {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Chapter 5: The Climax",
      "content": "The hero finally faces the villain...",
      "chapterNumber": 5,
      "book": "507f1f77bcf86cd799439012",
      "createdAt": "2025-11-19T10:30:00.000Z"
    }
  }
}
```

---

#### PATCH `/api/books/:bookId/chapters/:chapterNumber`
Update a specific chapter.

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Request Body**:
```json
{
  "title": "Chapter 5: The Epic Climax",
  "content": "Updated chapter content..."
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Chapter updated successfully",
  "data": {
    "chapter": {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Chapter 5: The Epic Climax",
      "content": "Updated chapter content...",
      "chapterNumber": 5
    }
  }
}
```

---

#### DELETE `/api/books/:bookId/chapters/:chapterNumber`
Delete a specific chapter.

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Chapter deleted successfully",
  "data": {}
}
```

**Note**: Subsequent chapters will be renumbered automatically.

---

#### POST `/api/books/:bookId/chapters/reorder`
Reorder chapters.

**Access**: Protected (AUTHOR - own books only, or ADMIN)

**Request Body**:
```json
{
  "chapterOrder": [3, 1, 2, 4, 5]
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Chapters reordered successfully",
  "data": {}
}
```

---

### Subscription Endpoints

#### POST `/api/subscriptions/activate`
Activate a subscription plan.

**Access**: Protected

**Request Body**:
```json
{
  "plan": "premium"
}
```

**Available Plans**:
- `basic`: Basic subscription (30 days)
- `premium`: Premium subscription (30 days)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Subscription activated successfully",
  "data": {
    "subscription": {
      "plan": "premium",
      "status": "active",
      "expiresAt": "2025-12-19T10:30:00.000Z"
    }
  }
}
```

---

#### GET `/api/subscriptions/status`
Get current subscription status.

**Access**: Protected

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Subscription status retrieved",
  "data": {
    "subscription": {
      "plan": "premium",
      "status": "active",
      "expiresAt": "2025-12-19T10:30:00.000Z",
      "daysRemaining": 30
    }
  }
}
```

---

### Analytics Endpoints

#### GET `/api/analytics/public`
Get public platform analytics (top books and authors leaderboard).

**Access**: Public

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Public analytics retrieved successfully.",
  "data": {
    "topBooks": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Amazing Fantasy Novel",
        "viewCount": 15420,
        "likes": 234,
        "author": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Author",
          "avatar": "/uploads/profile_images/avatar.jpg",
          "email": "author@example.com"
        },
        "image": "/uploads/book_covers/cover.jpg",
        "genre": "Fantasy",
        "isPremium": false,
        "publishedDate": "2025-01-01T00:00:00.000Z"
      }
    ],
    "topAuthors": [
      {
        "authorId": "507f1f77bcf86cd799439013",
        "authorName": "John Author",
        "authorEmail": "author@example.com",
        "authorAvatar": "/uploads/profile_images/avatar.jpg",
        "totalViews": 25000,
        "totalLikes": 500,
        "bookCount": 5
      }
    ]
  }
}
```

---

### Admin Endpoints

#### GET `/api/admin/analytics`
Get detailed platform analytics (admin only).

**Access**: Protected (ADMIN only)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Analytics retrieved successfully.",
  "data": {
    "totalUsers": 1250,
    "totalBooks": 150,
    "publishedBooks": 120,
    "draftBooks": 30,
    "totalChapters": 3500,
    "totalLikes": 15000,
    "totalViews": 250000,
    "basicSubscribers": 45,
    "premiumSubscribers": 85,
    "freeUsers": 1120,
    "revenueThisMonth": 1075,
    "users": {
      "total": 1250,
      "roles": {
        "READER": 800,
        "AUTHOR": 430,
        "ADMIN": 20
      },
      "subscriptionBreakdown": {
        "basicSubscribers": 45,
        "premiumSubscribers": 85,
        "freeUsers": 1120
      }
    },
    "books": {
      "total": 150,
      "status": {
        "published": 120,
        "draft": 30
      },
      "premium": 45,
      "totalViews": 250000,
      "totalLikes": 15000
    },
    "detailed": {
      "newUsersLast30Days": [
        { "_id": "2025-10-20", "count": 15 },
        { "_id": "2025-10-21", "count": 23 }
      ],
      "topBooks": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "title": "Top Book",
          "viewCount": 5420,
          "likes": 234
        }
      ],
      "topAuthors": [
        {
          "authorId": "507f1f77bcf86cd799439013",
          "authorName": "Top Author",
          "totalViews": 25000,
          "totalLikes": 500,
          "bookCount": 5
        }
      ]
    }
  }
}
```

**Revenue Calculation**:
- Basic Plan: $5 per subscriber
- Premium Plan: $10 per subscriber
- Revenue is calculated based on active subscriptions activated in the current month

---

## Error Handling

### Error Response Format
All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": {
    "statusCode": 400,
    "details": "Additional error details"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

### Common Error Scenarios

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "statusCode": 400,
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": {
    "statusCode": 401
  }
}
```

#### Authorization Error (403)
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "error": {
    "statusCode": 403
  }
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "message": "Book not found",
  "error": {
    "statusCode": 404
  }
}
```

#### Premium Content Error (403)
```json
{
  "success": false,
  "message": "This book is premium. Please subscribe to access.",
  "error": {
    "statusCode": 403,
    "isPremium": true
  }
}
```

---

## File Uploads

### Profile Images
- **Endpoint**: `PATCH /api/users/me/profile-image`
- **Field name**: `avatar`
- **Allowed formats**: JPG, JPEG, PNG, GIF, WebP
- **Max size**: 5MB
- **Storage path**: `/uploads/profile_images/`
- **File naming**: `{timestamp}-{originalname}`

### Book Covers
- **Endpoint**: `POST /api/books` or `PATCH /api/books/:id`
- **Field name**: `image`
- **Allowed formats**: JPG, JPEG, PNG, GIF, WebP
- **Max size**: 5MB
- **Storage path**: `/uploads/book_covers/`
- **File naming**: `{timestamp}-{originalname}`

### Upload Example (Frontend)
```javascript
const formData = new FormData();
formData.append('avatar', imageFile);

const response = await fetch('http://localhost:5001/api/users/me/profile-image', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/readian
TEST_MONGO_URI=mongodb://localhost:27017/readian_test

# JWT Secrets
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_ACCESS_EXPIRY=900
JWT_REFRESH_EXPIRY=1209600

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# Email Verification
EMAIL_VERIFICATION_EXPIRY=900

# Email Service (optional - for production)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Configuration Details

- **JWT_ACCESS_EXPIRY**: Access token expiry in seconds (default: 900 = 15 minutes)
- **JWT_REFRESH_EXPIRY**: Refresh token expiry in seconds (default: 1209600 = 14 days)
- **EMAIL_VERIFICATION_EXPIRY**: Email verification code expiry in seconds (default: 900 = 15 minutes)
- **BCRYPT_SALT_ROUNDS**: Number of rounds for password hashing (default: 12)

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 login attempts per 15 minutes per IP
- **File uploads**: 10 uploads per 15 minutes per user

---

## CORS Configuration

The API is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable.

**Default**: `http://localhost:3000`

Credentials (cookies, authorization headers) are enabled.

---

## Security Features

1. **Helmet.js**: Security headers
2. **CORS**: Cross-origin resource sharing control
3. **JWT**: Secure token-based authentication
4. **Bcrypt**: Password hashing with salt rounds
5. **Input Validation**: Zod schema validation on all inputs
6. **Rate Limiting**: Prevent brute force attacks
7. **File Upload Validation**: Type and size restrictions
8. **SQL Injection Prevention**: MongoDB parameterized queries
9. **XSS Prevention**: Input sanitization

---

## Database Indexes

### Optimized Queries
- User email: Unique index
- Book author + status: Compound index
- Chapter book + chapterNumber: Unique compound index
- Refresh token: Index on token and expiresAt
- Email verification: Index on email and expiresAt

---

## Testing the API

### Using cURL

**Register a user**:
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Get books** (with authentication):
```bash
curl -X GET http://localhost:5001/api/books \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables for `baseUrl` and `accessToken`
3. Use the `/api/auth/login` endpoint to get tokens
4. Set the `Authorization` header as `Bearer {{accessToken}}`
5. Test all endpoints

---

## Deployment Considerations

### Production Checklist
- [ ] Set strong JWT secrets
- [ ] Configure proper MONGO_URI for production database
- [ ] Set NODE_ENV to "production"
- [ ] Configure email service for verification emails
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up proper file storage (Cloudinary or S3)
- [ ] Configure logging and monitoring
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Review and test all security measures

### Recommended Production Setup
- **Database**: MongoDB Atlas or similar managed service
- **File Storage**: Cloudinary, AWS S3, or Google Cloud Storage
- **Email Service**: SendGrid, Mailgun, or AWS SES
- **Hosting**: Heroku, AWS EC2, DigitalOcean, or similar
- **Monitoring**: New Relic, DataDog, or similar

---

## Common Integration Patterns

### Authentication Flow (Frontend)
```javascript
// 1. Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name })
});

// 2. Verify email
const verifyResponse = await fetch('/api/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, code })
});

// 3. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, refreshToken } = await loginResponse.json();

// Store tokens securely (e.g., httpOnly cookies or secure storage)
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 4. Make authenticated requests
const booksResponse = await fetch('/api/books', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Token Refresh Flow
```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (response.ok) {
    const { accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  } else {
    // Refresh token expired, redirect to login
    window.location.href = '/login';
  }
}

// Intercept 401 errors and refresh token
async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem('accessToken');
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    accessToken = await refreshAccessToken();
    
    // Retry request with new token
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
  
  return response;
}
```

### Pagination Implementation
```javascript
// Frontend pagination hook
function useBooks(page = 1, limit = 10) {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      const response = await fetch(`/api/books?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        setBooks(data.data.books);
        setPagination(data.data.pagination);
      }
      setLoading(false);
    }
    
    fetchBooks();
  }, [page, limit]);
  
  return { books, pagination, loading };
}
```

### File Upload Implementation
```javascript
// Upload profile image
async function uploadProfileImage(imageFile) {
  const formData = new FormData();
  formData.append('avatar', imageFile);
  
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/users/me/profile-image', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });
  
  return await response.json();
}

// Create book with cover image
async function createBook(bookData, coverImage) {
  const formData = new FormData();
  
  // Append book data
  formData.append('title', bookData.title);
  formData.append('genre', bookData.genre);
  formData.append('tags', bookData.tags);
  formData.append('isPremium', bookData.isPremium);
  formData.append('chapters', JSON.stringify(bookData.chapters));
  
  // Append image
  if (coverImage) {
    formData.append('image', coverImage);
  }
  
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/books', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });
  
  return await response.json();
}
```

---

## Support & Contact

For questions or issues regarding the API, please contact the development team or create an issue in the project repository.

**API Version**: 1.0.0  
**Last Updated**: November 19, 2025

---

## Changelog

### Version 1.0.0 (November 2025)
- Initial API release
- User authentication with email verification
- Book and chapter management
- Like/Unlike functionality
- Subscription system (basic/premium)
- File uploads for avatars and book covers
- Search and filtering
- Role-based access control (READER, AUTHOR, ADMIN)
- Analytics endpoints
- Admin dashboard support

