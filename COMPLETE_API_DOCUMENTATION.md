# Readian Backend - Complete API Documentation

## Overview
Readian is a book reading platform backend API that supports user authentication, book management, chapter management, subscriptions, likes, and analytics. This documentation provides exact details for frontend integration.

**Base URL**: `http://localhost:5001/api`

**Response Format**: All responses follow this structure:
```json
{
  "success": true,
  "message": "Description of the result",
  "data": { ... }
}
```

---

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Book Management](#book-management)
4. [Chapter Management](#chapter-management)
5. [Like/Unlike Books](#likeunlike-books)
6. [Subscription Management](#subscription-management)
7. [Analytics](#analytics)
8. [Admin Endpoints](#admin-endpoints)

---

## Authentication

### 1. Register a New User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

---

### 2. Verify Email
**POST** `/auth/verify-email`

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "AUTHOR",
      "email_verified": true,
      "plan": "free",
      "subscriptionStatus": "inactive",
      "createdAt": "2025-11-20T10:00:00.000Z",
      "updatedAt": "2025-11-20T10:00:00.000Z"
    }
  }
}
```

---

### 3. Resend Verification Code
**POST** `/auth/resend-verification`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification code has been resent to your email.",
  "data": {}
}
```

---

### 4. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
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
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "AUTHOR",
      "email_verified": true,
      "plan": "free",
      "subscriptionStatus": "inactive",
      "avatar": "https://example.com/avatar.jpg",
      "coverImage": null,
      "bio": null
    }
  }
}
```

---

### 5. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "AUTHOR",
      "email_verified": true,
      "plan": "free",
      "subscriptionStatus": "inactive",
      "avatar": "https://example.com/avatar.jpg",
      "coverImage": null,
      "bio": null,
      "likedBooks": ["book_id_1", "book_id_2"]
    }
  }
}
```

---

### 6. Refresh Token
**POST** `/auth/refresh-token`

**Headers:**
```
Authorization: Bearer <accessToken>
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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 7. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
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
  "data": {}
}
```

---

### 8. Logout All Devices
**POST** `/auth/logout-all-devices`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully.",
  "data": {}
}
```

---

### 9. Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset code has been sent to your email.",
  "data": {}
}
```

---

### 10. Verify Password Reset Code
**POST** `/auth/verify-password-reset-code`

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reset code is valid.",
  "data": {}
}
```

---

### 11. Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully.",
  "data": {}
}
```

---

### 12. Change Password (Authenticated)
**POST** `/auth/change-password`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": {}
}
```

---

## User Management

### 1. Update Current User Profile
**PATCH** `/users/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "bio": "A passionate writer and reader."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Your profile has been updated.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "user@example.com",
    "role": "AUTHOR",
    "email_verified": true,
    "plan": "free",
    "subscriptionStatus": "inactive",
    "bio": "A passionate writer and reader.",
    "avatar": "https://example.com/avatar.jpg",
    "coverImage": null
  }
}
```

---

### 2. Update Profile Image
**PATCH** `/users/me/profile-image`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
avatar: <image file>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile image updated successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "user@example.com",
    "avatar": "http://localhost:5001/uploads/profile_images/avatar-1234567890.jpg",
    "role": "AUTHOR",
    "plan": "free"
  }
}
```

---

### 3. Update Cover Image
**PATCH** `/users/me/cover-image`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
coverImage: <image file>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cover image updated successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "user@example.com",
    "coverImage": "http://localhost:5001/uploads/cover_images/cover-1234567890.jpg",
    "role": "AUTHOR",
    "plan": "free"
  }
}
```

---

### 4. Become an Author
**POST** `/users/me/become-author`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Congratulations! You are now a Author.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "user@example.com",
    "role": "AUTHOR",
    "email_verified": true,
    "plan": "free"
  }
}
```

---

### 5. Get My Books (Author Only)
**GET** `/users/me/books?status=published&page=1&limit=10`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `status` (optional): `draft` or `published`
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

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
        "author": "507f1f77bcf86cd799439011",
        "tags": "fiction, adventure",
        "genre": "Adventure",
        "rating": 4.5,
        "image": "http://localhost:5001/uploads/book_covers/book1.jpg",
        "status": "published",
        "bookStatus": "ongoing",
        "isPremium": false,
        "publishedDate": "2025-11-20T10:00:00.000Z",
        "viewCount": 150,
        "likes": 25,
        "readingTime": "15 min",
        "totalChapters": 10,
        "createdAt": "2025-11-20T10:00:00.000Z",
        "updatedAt": "2025-11-20T10:00:00.000Z"
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

### 6. Get Author Stats (Author Only)
**GET** `/users/me/author-stats`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Author stats retrieved successfully.",
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

### 7. Get Liked Books
**GET** `/users/me/liked-books?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

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
          "name": "John Author",
          "avatar": "http://localhost:5001/uploads/profile_images/avatar.jpg"
        },
        "genre": "Fantasy",
        "tags": "magic, adventure",
        "rating": 4.8,
        "image": "http://localhost:5001/uploads/book_covers/book.jpg",
        "isPremium": false,
        "likes": 150,
        "viewCount": 2500,
        "publishedDate": "2025-10-15T10:00:00.000Z",
        "totalChapters": 15
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

### 8. Get All Users (Admin Only)
**GET** `/users/`

**Headers:**
```
Authorization: Bearer <accessToken>
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
      "avatar": "http://localhost:5001/uploads/profile_images/avatar.jpg",
      "createdAt": "2025-11-01T10:00:00.000Z"
    }
  ]
}
```

---

### 9. Get User by ID (Admin Only)
**GET** `/users/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
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
    "avatar": "http://localhost:5001/uploads/profile_images/avatar.jpg",
    "coverImage": null,
    "bio": "A writer",
    "likedBooks": ["book_id_1", "book_id_2"],
    "createdAt": "2025-11-01T10:00:00.000Z"
  }
}
```

---

### 10. Update User by Admin
**PATCH** `/users/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "role": "ADMIN",
  "plan": "premium"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "_id": "user_id_1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN",
    "plan": "premium"
  }
}
```

---

### 11. Delete User (Admin Only)
**DELETE** `/users/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
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

## Book Management

### 1. Get All Books (Public)
**GET** `/books?page=1&limit=10`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Response (200):**
```json
{
  "success": true,
  "message": "Books retrieved successfully.",
  "data": {
    "books": [
      {
        "_id": "book_id_1",
        "title": "Amazing Book",
        "author": "author_id",
        "tags": "fiction, drama",
        "genre": "Drama",
        "rating": 4.5,
        "image": "http://localhost:5001/uploads/book_covers/book.jpg",
        "status": "published",
        "bookStatus": "ongoing",
        "isPremium": false,
        "publishedDate": "2025-11-15T10:00:00.000Z",
        "viewCount": 500,
        "likes": 75,
        "readingTime": "20 min",
        "totalChapters": 12,
        "createdAt": "2025-11-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalBooks": 50,
      "hasMore": true
    }
  }
}
```

---

### 2. Search Books
**GET** `/books/search?title=adventure&page=1&limit=10`

**Query Parameters:**
- `title` (optional): Search by book title
- `author` (optional): Search by author name
- `genre` (optional, premium only): Filter by genre
- `tags` (optional, premium only): Filter by tags
- `sortByLikes` (optional, premium only): `asc` or `desc`
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Response (200):**
```json
{
  "success": true,
  "message": "Books retrieved successfully.",
  "data": {
    "books": [
      {
        "_id": "book_id_1",
        "title": "Adventure Book",
        "author": "author_id",
        "genre": "Adventure",
        "tags": "action, adventure",
        "rating": 4.7,
        "image": "http://localhost:5001/uploads/book_covers/book.jpg",
        "status": "published",
        "isPremium": false,
        "viewCount": 1000,
        "likes": 200
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

### 3. Get Book by ID (with Chapters)
**GET** `/books/:id?chapterPage=1&chapterLimit=10`

**Headers (Optional - for premium content):**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `chapterPage` (optional, default: 1): Chapter page number
- `chapterLimit` (optional, default: 10): Chapters per page

**Response (200):**
```json
{
  "success": true,
  "message": "Book retrieved successfully.",
  "data": {
    "_id": "book_id_1",
    "title": "Amazing Book",
    "readingTime": "25 min",
    "author": "author_id",
    "tags": "fiction, drama",
    "genre": "Drama",
    "rating": 4.5,
    "image": "http://localhost:5001/uploads/book_covers/book.jpg",
    "status": "published",
    "bookStatus": "ongoing",
    "isPremium": false,
    "publishedDate": "2025-11-15T10:00:00.000Z",
    "viewCount": 501,
    "likes": 75,
    "likedBy": ["user_id_1", "user_id_2"],
    "chapters": [
      {
        "_id": "chapter_id_1",
        "title": "Chapter 1: The Beginning",
        "content": "Chapter content here...",
        "book": "book_id_1",
        "chapterNumber": 1,
        "createdAt": "2025-11-10T10:00:00.000Z",
        "updatedAt": "2025-11-10T10:00:00.000Z"
      }
    ],
    "tableOfContents": [
      "Chapter 1: The Beginning",
      "Chapter 2: The Journey"
    ],
    "chapterPagination": {
      "totalPages": 2,
      "currentPage": 1,
      "totalChapters": 12
    }
  }
}
```

---

### 4. Get Book Chapters
**GET** `/books/:id/chapters?chapterPage=1&chapterLimit=10`

**Headers (Optional - for premium content):**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `chapterPage` (optional, default: 1): Chapter page number
- `chapterLimit` (optional, default: 10): Chapters per page

**Response (200):**
```json
{
  "success": true,
  "message": "Chapters retrieved successfully.",
  "data": {
    "bookId": "book_id_1",
    "bookTitle": "Amazing Book",
    "chapters": [
      {
        "_id": "chapter_id_1",
        "title": "Chapter 1: The Beginning",
        "content": "Chapter content here...",
        "book": "book_id_1",
        "chapterNumber": 1,
        "createdAt": "2025-11-10T10:00:00.000Z",
        "updatedAt": "2025-11-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "totalPages": 2,
      "currentPage": 1,
      "totalChapters": 12
    }
  }
}
```

---

### 5. Get Specific Chapter by Number
**GET** `/books/:id/chapters/:chapterNumber`

**Headers (Optional - for premium content):**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chapter retrieved successfully.",
  "data": {
    "_id": "chapter_id_1",
    "title": "Chapter 1: The Beginning",
    "content": "Full chapter content here...",
    "book": "book_id_1",
    "chapterNumber": 1,
    "createdAt": "2025-11-10T10:00:00.000Z",
    "updatedAt": "2025-11-10T10:00:00.000Z",
    "totalChapters": 12
  }
}
```

---

### 6. Create a Book (Author/Admin Only)
**POST** `/books`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
title: "My New Book"
tags: "fiction, drama"
genre: "Drama"
isPremium: false
image: <image file>
chapters: [{"title": "Chapter 1", "content": "Content here..."}]
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book created successfully.",
  "data": {
    "_id": "new_book_id",
    "title": "My New Book",
    "author": "author_id",
    "tags": "fiction, drama",
    "genre": "Drama",
    "rating": null,
    "image": "http://localhost:5001/uploads/book_covers/book-123.jpg",
    "status": "draft",
    "bookStatus": "ongoing",
    "isPremium": false,
    "viewCount": 0,
    "likes": 0,
    "readingTime": "5 min",
    "likedBy": [],
    "createdAt": "2025-11-20T10:00:00.000Z"
  }
}
```

---

### 7. Update a Book (Author/Admin Only)
**PATCH** `/books/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
title: "Updated Book Title"
genre: "Fantasy"
image: <image file>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book updated successfully.",
  "data": {
    "_id": "book_id",
    "title": "Updated Book Title",
    "genre": "Fantasy",
    "image": "http://localhost:5001/uploads/book_covers/book-updated.jpg",
    "status": "draft",
    "updatedAt": "2025-11-20T11:00:00.000Z"
  }
}
```

---

### 8. Delete a Book (Author/Admin Only)
**DELETE** `/books/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
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

---

### 9. Publish a Book (Author/Admin Only)
**POST** `/books/:id/publish`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book published successfully.",
  "data": {
    "_id": "book_id",
    "title": "My Book",
    "status": "published",
    "publishedDate": "2025-11-20T12:00:00.000Z"
  }
}
```

---

### 10. Toggle Premium Status (Author/Admin Only)
**POST** `/books/:id/toggle-premium`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book marked as premium.",
  "data": {
    "_id": "book_id",
    "title": "My Book",
    "isPremium": true
  }
}
```

---

### 11. Update Book Status (Author/Admin Only)
**PATCH** `/books/:id/status`

**Headers:**
```
Authorization: Bearer <accessToken>
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
    "_id": "book_id",
    "title": "My Book",
    "bookStatus": "finished"
  }
}
```

---

## Chapter Management

### 1. Add a Chapter (Author/Admin Only)
**POST** `/books/:bookId/chapters`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "title": "Chapter 5: The Battle",
  "content": "The content of chapter 5..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chapter added successfully.",
  "data": {
    "_id": "chapter_id",
    "title": "Chapter 5: The Battle",
    "content": "The content of chapter 5...",
    "book": "book_id",
    "chapterNumber": 5,
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z"
  }
}
```

---

### 2. Update a Chapter (Author/Admin Only)
**PATCH** `/books/:bookId/chapters/:chapterNumber`

**Headers:**
```
Authorization: Bearer <accessToken>
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
    "_id": "chapter_id",
    "title": "Updated Chapter Title",
    "content": "Updated chapter content...",
    "book": "book_id",
    "chapterNumber": 5,
    "updatedAt": "2025-11-20T11:00:00.000Z"
  }
}
```

---

### 3. Delete a Chapter (Author/Admin Only)
**DELETE** `/books/:bookId/chapters/:chapterNumber`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chapter deleted successfully.",
  "data": {
    "message": "Chapter deleted successfully."
  }
}
```

---

### 4. Reorder Chapters (Author/Admin Only)
**POST** `/books/:bookId/chapters/reorder`

**Headers:**
```
Authorization: Bearer <accessToken>
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

**Note:** The `chapterOrder` array contains the current chapter numbers in the desired new order.

---

## Like/Unlike Books

### 1. Like a Book
**POST** `/books/:id/like`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book liked successfully.",
  "data": {
    "bookId": "book_id",
    "likes": 76
  }
}
```

---

### 2. Unlike a Book
**POST** `/books/:id/unlike`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book unliked successfully.",
  "data": {
    "bookId": "book_id",
    "likes": 75
  }
}
```

---

## Subscription Management

### 1. Activate Subscription
**POST** `/subscriptions/activate`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "plan": "premium"
}
```

**Available Plans:**
- `basic` - $5/month
- `premium` - $10/month

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription activated successfully for the premium plan.",
  "data": {
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2025-12-20T10:00:00.000Z"
  }
}
```

---

### 2. Get Subscription Status
**GET** `/subscriptions/status`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription status retrieved.",
  "data": {
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2025-12-20T10:00:00.000Z",
    "daysRemaining": 30
  }
}
```

---

## Analytics

### 1. Get Public Analytics
**GET** `/analytics/public`

**Response (200):**
```json
{
  "success": true,
  "message": "Public analytics retrieved successfully.",
  "data": {
    "topBooks": [
      {
        "_id": "book_id_1",
        "title": "Popular Book",
        "viewCount": 5000,
        "likes": 450,
        "author": {
          "_id": "author_id",
          "name": "John Author",
          "avatar": "http://localhost:5001/uploads/profile_images/avatar.jpg",
          "email": "john@example.com"
        },
        "image": "http://localhost:5001/uploads/book_covers/book.jpg",
        "genre": "Fantasy",
        "isPremium": false,
        "publishedDate": "2025-10-01T10:00:00.000Z"
      }
    ],
    "topAuthors": [
      {
        "authorId": "author_id",
        "authorName": "John Author",
        "authorEmail": "john@example.com",
        "authorAvatar": "http://localhost:5001/uploads/profile_images/avatar.jpg",
        "totalViews": 15000,
        "totalLikes": 1200,
        "bookCount": 8
      }
    ]
  }
}
```

---

## Admin Endpoints

### 1. Get Admin Analytics
**GET** `/admin/analytics`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Required Role:** ADMIN

**Response (200):**
```json
{
  "success": true,
  "message": "Analytics retrieved successfully.",
  "data": {
    "totalUsers": 150,
    "totalBooks": 75,
    "publishedBooks": 50,
    "draftBooks": 25,
    "totalChapters": 450,
    "totalLikes": 2500,
    "totalViews": 50000,
    "basicSubscribers": 20,
    "premiumSubscribers": 15,
    "freeUsers": 115,
    "revenueThisMonth": 250,
    "users": {
      "total": 150,
      "roles": {
        "READER": 50,
        "AUTHOR": 95,
        "ADMIN": 5
      },
      "subscriptionBreakdown": {
        "basicSubscribers": 20,
        "premiumSubscribers": 15,
        "freeUsers": 115
      }
    },
    "books": {
      "total": 75,
      "status": {
        "published": 50,
        "draft": 25
      },
      "premium": 30,
      "totalViews": 50000,
      "totalLikes": 2500
    },
    "detailed": {
      "newUsersLast30Days": [
        {
          "_id": "2025-11-01",
          "count": 5
        },
        {
          "_id": "2025-11-02",
          "count": 8
        }
      ],
      "topBooks": [
        {
          "_id": "book_id_1",
          "title": "Popular Book",
          "viewCount": 5000,
          "likes": 450,
          "author": {
            "_id": "author_id",
            "name": "John Author",
            "avatar": "http://localhost:5001/uploads/profile_images/avatar.jpg"
          }
        }
      ],
      "topAuthors": [
        {
          "authorId": "author_id",
          "authorName": "John Author",
          "totalViews": 15000,
          "totalLikes": 1200,
          "bookCount": 8
        }
      ]
    }
  }
}
```

---

### 2. Delete Any Book (Admin Only)
**DELETE** `/admin/books/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Required Role:** ADMIN

**Response (200):**
```json
{
  "success": true,
  "message": "Book and all associated data deleted successfully by admin.",
  "data": {
    "message": "Book and all associated data deleted successfully by admin."
  }
}
```

**Note:** This endpoint allows admins to delete any book regardless of authorship. It also:
- Deletes all chapters associated with the book
- Removes the book from all users' liked books arrays
- Permanently deletes the book from the database

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Common Error Codes:

- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **500 Internal Server Error**: Server error

### Example Error Response:

```json
{
  "success": false,
  "message": "Email is already registered.",
  "error": "EMAIL_ALREADY_EXISTS"
}
```

---

## Authentication & Authorization

### Token-based Authentication

Most endpoints require authentication using JWT tokens. Include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

### Roles

- **READER**: Can read books, like books, subscribe
- **AUTHOR**: Can create, update, delete their own books and chapters
- **ADMIN**: Full access to all resources

### Soft Authentication

Some endpoints (like viewing books) support "soft authentication" where:
- If a user is logged in, their subscription is checked for premium content
- If no user is logged in, only free content is accessible

---

## File Upload

### Supported Endpoints:
- `/users/me/profile-image` - Profile image upload
- `/users/me/cover-image` - Cover image upload
- `/books` - Book cover upload (during creation)
- `/books/:id` - Book cover upload (during update)

### File Requirements:
- **Format**: JPG, JPEG, PNG
- **Max Size**: 5MB
- **Field Name**: Varies by endpoint (avatar, coverImage, image)

### Storage:
Files are stored locally in the `uploads/` directory and served via static file serving at:
- Profile images: `http://localhost:5001/uploads/profile_images/`
- Cover images: `http://localhost:5001/uploads/cover_images/`
- Book covers: `http://localhost:5001/uploads/book_covers/`

---

## Pagination

Endpoints that support pagination use these query parameters:

- `page` (default: 1): The page number
- `limit` (default: 10, max: 100): Items per page

Paginated responses include:

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

---

## Reading Time Calculation

Reading time is automatically calculated when:
- A book is created with chapters
- A book is updated with new chapters
- Chapters are added to a book

The calculation is based on an average reading speed of 200 words per minute.

---

## Subscription Features

### Free Plan
- Read free books
- Like books
- Basic search (by title and author only)

### Basic Plan ($5/month)
- All free features
- Access to premium books
- Advanced search (filter by genre, tags)
- Sort by likes

### Premium Plan ($10/month)
- All basic features
- Priority support (implementation pending)
- Early access to new books (implementation pending)

---

## Notes for Frontend Integration

1. **Base URL**: Update the base URL in your API client to match your backend server
2. **Token Storage**: Store access tokens securely (e.g., httpOnly cookies or secure storage)
3. **Token Refresh**: Implement automatic token refresh using the refresh token endpoint
4. **Error Handling**: Always check the `success` field in responses
5. **File Uploads**: Use `FormData` for endpoints that accept file uploads
6. **Premium Content**: Check user subscription status before attempting to access premium content
7. **Draft Books**: Only authors and admins can see draft books
8. **Real-time Updates**: Consider implementing polling or WebSockets for real-time analytics

---

## Environment Variables

Required environment variables:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/readian
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@readian.com

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Testing

### Recommended Testing Order:

1. **Authentication Flow**
   - Register → Verify Email → Login
   - Test token refresh and logout

2. **User Management**
   - Update profile
   - Upload images
   - Become author

3. **Book Creation**
   - Create book with chapters
   - Publish book
   - Update book details

4. **Chapter Management**
   - Add chapters
   - Update chapters
   - Reorder chapters
   - Delete chapters

5. **Interactions**
   - Like/unlike books
   - View books
   - Search books

6. **Subscriptions**
   - Activate subscription
   - Check status
   - Access premium content

7. **Analytics**
   - Public analytics
   - Author stats
   - Admin analytics

---

## Support

For issues or questions, please contact the development team or open an issue in the project repository.

---

**Last Updated**: November 20, 2025
**API Version**: 1.0.0

