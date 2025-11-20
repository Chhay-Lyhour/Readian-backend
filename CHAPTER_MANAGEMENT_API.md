# Chapter Management & Image Upload API Documentation

## Overview
This document describes the new chapter management endpoints and the updated image upload functionality.

## Table of Contents
1. [Image Upload System](#image-upload-system)
2. [Chapter Management Endpoints](#chapter-management-endpoints)
3. [Liked Books Endpoint](#liked-books-endpoint)

---

## Image Upload System

### Overview
The system now supports **both Cloudinary and local file storage**:
- **Cloudinary** (preferred): If configured with environment variables
- **Local Storage** (fallback): Automatically used if Cloudinary is not configured

### Configuration

#### Using Cloudinary (Optional)
Set these environment variables in your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Using Local Storage (Default)
No configuration needed! Files are automatically saved to:
- Book covers: `/uploads/book_covers/`
- Profile images: `/uploads/profile_images/`

Files are served at: `http://localhost:PORT/uploads/{folder}/{filename}`

### Endpoints Using Image Upload

#### 1. Update Profile Image
```
PATCH /api/users/me/profile-image
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- avatar: (file) - Image file (JPG, PNG, etc.) - Max 5MB
```

**Example using curl:**
```bash
curl -X PATCH http://localhost:3000/api/users/me/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Profile image updated successfully.",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "/uploads/profile_images/1234567890-abc123.jpg"
  }
}
```

#### 2. Create Book with Cover Image
```
POST /api/books
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- title: (string) Book title
- chapters: (JSON string) Array of chapters
- image: (file) - Cover image - Max 5MB
- isPremium: (boolean) Optional
- genre: (string) Optional
- tags: (string) Optional
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Book" \
  -F 'chapters=[{"title":"Chapter 1","content":"Content here"}]' \
  -F "image=@/path/to/cover.jpg" \
  -F "isPremium=false"
```

#### 3. Update Book Cover Image
```
PATCH /api/books/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- image: (file) - New cover image - Max 5MB
- (other book fields optional)
```

---

## Chapter Management Endpoints

### Overview
Authors can now manage individual chapters without updating the entire book. This includes adding, updating, deleting, and reordering chapters.

### 1. Add a New Chapter
```
POST /api/books/:bookId/chapters
Authorization: Bearer {token}
Content-Type: application/json
Roles: AUTHOR, ADMIN
```

**Request Body:**
```json
{
  "title": "Chapter Title",
  "content": "Chapter content goes here..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chapter added successfully.",
  "data": {
    "_id": "chapter_id",
    "title": "Chapter Title",
    "content": "Chapter content goes here...",
    "book": "book_id",
    "chapterNumber": 4,
    "createdAt": "2025-11-18T...",
    "updatedAt": "2025-11-18T..."
  }
}
```

**Notes:**
- The chapter number is automatically assigned (next available number)
- Only the book's author or admin can add chapters
- The book's reading time is automatically recalculated

### 2. Update a Chapter
```
PATCH /api/books/:bookId/chapters/:chapterNumber
Authorization: Bearer {token}
Content-Type: application/json
Roles: AUTHOR, ADMIN
```

**Request Body:**
```json
{
  "title": "Updated Chapter Title",
  "content": "Updated content..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chapter updated successfully.",
  "data": {
    "_id": "chapter_id",
    "title": "Updated Chapter Title",
    "content": "Updated content...",
    "book": "book_id",
    "chapterNumber": 2,
    "updatedAt": "2025-11-18T..."
  }
}
```

**Notes:**
- Both `title` and `content` are optional (can update one or both)
- Only the book's author or admin can update chapters
- Reading time is recalculated if content is changed

### 3. Delete a Chapter
```
DELETE /api/books/:bookId/chapters/:chapterNumber
Authorization: Bearer {token}
Roles: AUTHOR, ADMIN
```

**Response:**
```json
{
  "success": true,
  "message": "Chapter deleted successfully.",
  "data": {
    "message": "Chapter deleted successfully."
  }
}
```

**Notes:**
- Remaining chapters are automatically renumbered (e.g., if chapter 2 is deleted, chapter 3 becomes chapter 2)
- Only the book's author or admin can delete chapters
- Reading time is recalculated

### 4. Reorder Chapters
```
POST /api/books/:bookId/chapters/reorder
Authorization: Bearer {token}
Content-Type: application/json
Roles: AUTHOR, ADMIN
```

**Request Body:**
```json
{
  "chapterOrder": [3, 1, 2, 4]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chapters reordered successfully.",
  "data": {
    "chapters": [
      {
        "_id": "...",
        "title": "Chapter 3",
        "chapterNumber": 1
      },
      {
        "_id": "...",
        "title": "Chapter 1",
        "chapterNumber": 2
      },
      {
        "_id": "...",
        "title": "Chapter 2",
        "chapterNumber": 3
      },
      {
        "_id": "...",
        "title": "Chapter 4",
        "chapterNumber": 4
      }
    ]
  }
}
```

**Notes:**
- `chapterOrder` must contain all existing chapter numbers
- The array represents the new order (e.g., [3, 1, 2] means chapter 3 becomes 1, chapter 1 becomes 2, etc.)
- Only the book's author or admin can reorder chapters

### 5. Get All Chapters (Existing - Enhanced)
```
GET /api/books/:id/chapters?chapterPage=1&chapterLimit=10
Authorization: Optional (required for draft books)
```

**Response:**
```json
{
  "success": true,
  "message": "Chapters retrieved successfully.",
  "data": {
    "bookId": "book_id",
    "bookTitle": "Book Title",
    "chapters": [
      {
        "_id": "chapter_id",
        "title": "Chapter 1",
        "content": "Content...",
        "chapterNumber": 1
      }
    ],
    "pagination": {
      "totalPages": 5,
      "currentPage": 1,
      "totalChapters": 50
    }
  }
}
```

**Notes:**
- Supports pagination with `chapterPage` and `chapterLimit` query params
- Draft books can only be accessed by the author or admin
- Premium books require an active subscription

### 6. Get Specific Chapter (Existing - Enhanced)
```
GET /api/books/:id/chapters/:chapterNumber
Authorization: Optional (required for draft books)
```

**Response:**
```json
{
  "success": true,
  "message": "Chapter retrieved successfully.",
  "data": {
    "_id": "chapter_id",
    "title": "Chapter 2",
    "content": "Chapter content...",
    "book": "book_id",
    "chapterNumber": 2,
    "bookTitle": "Book Title",
    "navigation": {
      "hasNext": true,
      "hasPrevious": true,
      "totalChapters": 10
    }
  }
}
```

**Notes:**
- Includes navigation info (hasNext, hasPrevious)
- Draft books can only be accessed by the author or admin
- Premium books require an active subscription

---

## Liked Books Endpoint

### Get User's Liked Books (Enhanced)
```
GET /api/users/me/liked-books
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Liked books retrieved successfully.",
  "data": [
    {
      "_id": "book_id",
      "title": "Book Title",
      "author": "author_id",
      "genre": "Fantasy",
      "tags": "adventure, magic",
      "rating": 4.5,
      "image": "/uploads/book_covers/123.jpg",
      "isPremium": false,
      "likes": 150,
      "viewCount": 1000,
      "publishedDate": "2025-01-15T..."
    }
  ]
}
```

**Notes:**
- Now returns full book details (not just IDs)
- Only shows published books
- Requires authentication

---

## Book Management Endpoints

### 7. Toggle Premium Status
```
POST /api/books/:id/toggle-premium
Authorization: Bearer {token}
Roles: AUTHOR, ADMIN
```

**Description:**
Toggles the `isPremium` status of a book between `true` and `false`. Similar to the publish endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Book marked as premium." // or "Book marked as free."
  "data": {
    "_id": "book_id",
    "title": "Book Title",
    "isPremium": true,
    // ... other book fields
  }
}
```

**Notes:**
- Only the book's author or admin can toggle premium status
- Automatically switches between true/false
- No request body needed

**Example:**
```bash
curl -X POST http://localhost:3000/api/books/BOOK_ID/toggle-premium \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Update Book Status (Ongoing/Finished)
```
PATCH /api/books/:id/status
Authorization: Bearer {token}
Content-Type: application/json
Roles: AUTHOR, ADMIN
```

**Request Body:**
```json
{
  "bookStatus": "finished"  // or "ongoing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Book status updated successfully.",
  "data": {
    "_id": "book_id",
    "title": "Book Title",
    "bookStatus": "finished",
    // ... other book fields
  }
}
```

**Notes:**
- Only the book's author or admin can update status
- Valid values: `"ongoing"` or `"finished"`
- Helps readers know if a book is complete or still being written

**Example:**
```bash
# Mark book as finished
curl -X PATCH http://localhost:3000/api/books/BOOK_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookStatus": "finished"}'

# Mark book as ongoing
curl -X PATCH http://localhost:3000/api/books/BOOK_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookStatus": "ongoing"}'
```

### 9. Total Chapters Count

**Enhancement:**
All book endpoints now include `totalChapters` field in the response:

- `GET /api/books` - Each book in the list includes `totalChapters`
- `GET /api/books/:id` - Book details include `totalChapters` in `chapterPagination`
- `GET /api/users/me/books` - Author's books include `totalChapters`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "_id": "book_id",
        "title": "My Book",
        "totalChapters": 25,
        // ... other fields
      }
    ]
  }
}
```

---

## Example Workflows

### Workflow 1: Creating a Book and Adding Chapters

1. **Create a book with initial chapters:**
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Book",
    "chapters": [
      {"title": "Chapter 1", "content": "First chapter content..."}
    ]
  }'
```

2. **Add more chapters later:**
```bash
curl -X POST http://localhost:3000/api/books/BOOK_ID/chapters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chapter 2",
    "content": "Second chapter content..."
  }'
```

3. **Update a chapter:**
```bash
curl -X PATCH http://localhost:3000/api/books/BOOK_ID/chapters/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated second chapter content..."
  }'
```

### Workflow 2: Managing Book Cover Images

1. **Upload cover when creating book:**
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Book" \
  -F 'chapters=[{"title":"Ch 1","content":"Content"}]' \
  -F "image=@cover.jpg"
```

2. **Update cover image later:**
```bash
curl -X PATCH http://localhost:3000/api/books/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@new-cover.jpg"
```

### Workflow 3: Managing Book Status and Premium

1. **Create a free ongoing book:**
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Ongoing Story",
    "isPremium": false,
    "bookStatus": "ongoing",
    "chapters": [{"title": "Chapter 1", "content": "Beginning..."}]
  }'
```

2. **Toggle to premium:**
```bash
curl -X POST http://localhost:3000/api/books/BOOK_ID/toggle-premium \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Mark as finished when complete:**
```bash
curl -X PATCH http://localhost:3000/api/books/BOOK_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookStatus": "finished"}'
```

4. **View book with total chapters:**
```bash
curl http://localhost:3000/api/books/BOOK_ID
# Response includes: "totalChapters": 25
```

---

## Error Codes

| Error Code | Description |
|------------|-------------|
| `BOOK_NOT_FOUND` | The specified book does not exist |
| `CHAPTER_NOT_FOUND` | The specified chapter does not exist |
| `INSUFFICIENT_PERMISSIONS` | User is not the book's author |
| `INVALID_CHAPTER_ORDER` | Chapter order array is invalid |
| `FILE_NOT_PROVIDED` | No file was uploaded |
| `FILE_TOO_LARGE` | File exceeds 5MB limit |
| `INVALID_FILE_TYPE` | File is not an image |
| `FILE_SAVE_FAILED` | Failed to save file to storage |


