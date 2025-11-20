# Quick Start Testing Guide

## Prerequisites
1. Make sure MongoDB is running
2. Make sure your `.env` file is configured

## Start the Server

```bash
cd "/Users/sopheappit/Desktop/Training project/Readian-backend"
npm run dev
```

## Test the New Features

### 1. Test Local File Upload (No Cloudinary Needed!)

**Step 1: Register/Login to get a token**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Author",
    "email": "author@test.com",
    "password": "password123"
  }'

# Login (save the token from response)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@test.com",
    "password": "password123"
  }'
```

**Step 2: Upload a profile image**
```bash
# Replace YOUR_TOKEN with the token from login
# Replace /path/to/image.jpg with an actual image file
curl -X PATCH http://localhost:3000/api/users/me/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"

# Check the response - you'll see: "avatar": "/uploads/profile_images/..."
# Visit: http://localhost:3000/uploads/profile_images/FILENAME to see the image
```

### 2. Test Chapter Management

**Step 1: Create a book with initial chapters**
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Test Book",
    "isPremium": false,
    "chapters": [
      {
        "title": "Chapter 1: The Beginning",
        "content": "This is the content of chapter 1. It has lots of text..."
      },
      {
        "title": "Chapter 2: The Journey",
        "content": "This is the content of chapter 2. More adventures here..."
      }
    ]
  }'

# Save the book ID from the response
```

**Step 2: Add a new chapter**
```bash
# Replace BOOK_ID with your book's ID
curl -X POST http://localhost:3000/api/books/BOOK_ID/chapters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chapter 3: The Conclusion",
    "content": "This is the final chapter content..."
  }'
```

**Step 3: Update a chapter**
```bash
curl -X PATCH http://localhost:3000/api/books/BOOK_ID/chapters/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chapter 2: The Updated Journey",
    "content": "Updated content for chapter 2..."
  }'
```

**Step 4: View all chapters**
```bash
# Publish the book first
curl -X POST http://localhost:3000/api/books/BOOK_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all chapters
curl http://localhost:3000/api/books/BOOK_ID/chapters
```

**Step 5: Delete a chapter**
```bash
curl -X DELETE http://localhost:3000/api/books/BOOK_ID/chapters/2 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Now chapter 3 will become chapter 2 automatically!
```

**Step 6: Reorder chapters**
```bash
# First, add back a few chapters to have 3 chapters
# Then reorder them
curl -X POST http://localhost:3000/api/books/BOOK_ID/chapters/reorder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chapterOrder": [3, 1, 2]
  }'

# Chapter 3 becomes chapter 1, chapter 1 becomes chapter 2, etc.
```

### 3. Test Liked Books Feature

**Step 1: Like a book**
```bash
curl -X POST http://localhost:3000/api/books/BOOK_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 2: Get liked books (now with full details!)**
```bash
curl http://localhost:3000/api/users/me/liked-books \
  -H "Authorization: Bearer YOUR_TOKEN"

# You'll see full book details, not just IDs!
```

**Step 3: Unlike a book**
```bash
curl -X POST http://localhost:3000/api/books/BOOK_ID/unlike \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Book Cover Upload

```bash
# Create a book with a cover image
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Book with Cover" \
  -F 'chapters=[{"title":"Ch1","content":"Content1"}]' \
  -F "image=@/path/to/cover.jpg"

# Update book cover
curl -X PATCH http://localhost:3000/api/books/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/new-cover.jpg"
```

## Verify Files Are Saved Locally

Check the uploads directory:
```bash
ls -la "/Users/sopheappit/Desktop/Training project/Readian-backend/uploads/profile_images/"
ls -la "/Users/sopheappit/Desktop/Training project/Readian-backend/uploads/book_covers/"
```

Access images in browser:
- `http://localhost:3000/uploads/profile_images/FILENAME`
- `http://localhost:3000/uploads/book_covers/FILENAME`

## Common Issues & Solutions

### Issue: "Cannot find user"
**Solution**: Make sure you're using a valid token. Get a new token by logging in again.

### Issue: "Insufficient permissions"
**Solution**: Make sure you're the author of the book. Only book authors can manage chapters.

### Issue: "File upload failed"
**Solution**: 
- Check that the file is an image (JPG, PNG, etc.)
- Check that the file is under 5MB
- Make sure the field name is correct ("avatar" for profile, "image" for book cover)

### Issue: Images not accessible
**Solution**: 
- Make sure the server is running
- Check that files exist in the uploads directory
- Try accessing with full URL: `http://localhost:3000/uploads/...`

## What Changed?

### Before:
- ❌ Authors had to update entire book to change chapters
- ❌ Couldn't use local file storage (required Cloudinary)
- ❌ Liked books only returned book IDs
- ❌ No way to add/delete individual chapters

### After:
- ✅ Authors can add/update/delete individual chapters
- ✅ Local file storage works without Cloudinary
- ✅ Liked books return full book details
- ✅ Chapter numbers auto-renumber when deleting
- ✅ Reading time auto-updates
- ✅ Full CRUD operations on chapters

## All Available Endpoints

### Chapter Management
- `POST /api/books/:bookId/chapters` - Add chapter
- `PATCH /api/books/:bookId/chapters/:chapterNumber` - Update chapter
- `DELETE /api/books/:bookId/chapters/:chapterNumber` - Delete chapter
- `POST /api/books/:bookId/chapters/reorder` - Reorder chapters
- `GET /api/books/:id/chapters` - Get all chapters
- `GET /api/books/:id/chapters/:chapterNumber` - Get specific chapter

### Image Upload
- `PATCH /api/users/me/profile-image` - Upload avatar
- `POST /api/books` (with image field) - Upload book cover
- `PATCH /api/books/:id` (with image field) - Update book cover

### Liked Books
- `GET /api/users/me/liked-books` - Get liked books with full details
- `POST /api/books/:id/like` - Like a book
- `POST /api/books/:id/unlike` - Unlike a book

## Need More Help?

See the full documentation:
- **CHAPTER_MANAGEMENT_API.md** - Complete API reference
- **IMPLEMENTATION_SUMMARY.md** - Implementation details

