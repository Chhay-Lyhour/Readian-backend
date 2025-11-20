# Cloudinary API Testing Guide for Postman

This guide provides detailed instructions for testing all API endpoints that use Cloudinary for image uploads.

## Prerequisites

1. **Install Postman**: Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. **Server Running**: Ensure the backend server is running on `http://localhost:5001`
3. **User Account**: You need a registered user account with authentication token

## Authentication Setup

Most endpoints require authentication. Follow these steps:

### 1. Register a New User (if needed)

**Endpoint**: `POST /api/auth/register`

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Password123!",
  "role": "reader"
}
```

### 2. Login to Get Access Token

**Endpoint**: `POST /api/auth/login`

```json
{
  "email": "testuser@example.com",
  "password": "Password123!"
}
```

**Response** will include:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "user": { ... }
  }
}
```

### 3. Set Authorization Header

For all authenticated requests, add header:
- **Key**: `Authorization`
- **Value**: `Bearer YOUR_ACCESS_TOKEN`

---

## Cloudinary-Related Endpoints

## 1. Upload User Profile Image

**Purpose**: Upload and update user profile image to Cloudinary

**Endpoint**: `PUT /api/users/profile/image`

**Method**: `PUT`

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data`

### Postman Configuration:

1. **URL**: `http://localhost:5001/api/users/profile/image`
2. **Method**: `PUT`
3. **Headers**:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
4. **Body** (form-data):
   - **Key**: `profileImage` (Type: File)
   - **Value**: Select an image file from your computer (JPG, PNG, GIF)

### Expected Response:

```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/profile_images/abc123.jpg"
  }
}
```

### Testing Steps:

1. Open Postman
2. Create a new PUT request
3. Enter the URL: `http://localhost:5001/api/users/profile/image`
4. Go to **Authorization** tab → Select **Bearer Token** → Paste your access token
5. Go to **Body** tab → Select **form-data**
6. Add a new key: `profileImage`
7. Change the key type to **File** (dropdown on the right)
8. Click **Select Files** and choose an image
9. Click **Send**
10. Verify the response contains a Cloudinary URL
11. Check Cloudinary dashboard to confirm the image was uploaded

### Validation:

- ✅ Image should be uploaded to Cloudinary under `profile_images/` folder
- ✅ Old profile image should be deleted from Cloudinary (if exists)
- ✅ User record in database should have updated `avatar` field
- ✅ Image should be accessible via the returned URL

---

## 2. Upload Book Cover Image

**Purpose**: Upload book cover image to Cloudinary when creating a book

**Endpoint**: `POST /api/books`

**Method**: `POST`

**Authentication**: Required (Bearer Token - Author role)

**Content-Type**: `multipart/form-data`

### Postman Configuration:

1. **URL**: `http://localhost:5001/api/books`
2. **Method**: `POST`
3. **Headers**:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
4. **Body** (form-data):
   - **Key**: `title` | **Value**: `My Awesome Book`
   - **Key**: `description` | **Value**: `A great book about...`
   - **Key**: `genre` | **Value**: `Fiction`
   - **Key**: `tags` | **Value**: `adventure, fantasy`
   - **Key**: `isPremium` | **Value**: `false`
   - **Key**: `allowDownload` | **Value**: `true`
   - **Key**: `bookStatus` | **Value**: `ongoing`
   - **Key**: `coverImage` (Type: File) | **Value**: Select image file

### Expected Response:

```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "_id": "691e7e77d914693083f812fa",
    "title": "My Awesome Book",
    "image": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/book_covers/xyz789.jpg",
    "author": "...",
    ...
  }
}
```

### Testing Steps:

1. Open Postman
2. Create a new POST request
3. Enter the URL: `http://localhost:5001/api/books`
4. Go to **Authorization** tab → Select **Bearer Token** → Paste your access token
5. Go to **Body** tab → Select **form-data**
6. Add all required text fields (title, description, genre, etc.)
7. Add `coverImage` key and change type to **File**
8. Select an image file
9. Click **Send**
10. Verify the response contains a Cloudinary URL for the book cover
11. Check Cloudinary dashboard under `book_covers/` folder

### Validation:

- ✅ Book cover uploaded to Cloudinary under `book_covers/` folder
- ✅ Book record created with `image` field containing Cloudinary URL
- ✅ Image accessible via returned URL
- ✅ Image has appropriate transformations applied

---

## 3. Update Book Cover Image

**Purpose**: Update existing book's cover image

**Endpoint**: `PUT /api/books/:bookId`

**Method**: `PUT`

**Authentication**: Required (Bearer Token - Must be book author)

**Content-Type**: `multipart/form-data`

### Postman Configuration:

1. **URL**: `http://localhost:5001/api/books/691e7e77d914693083f812fa` (replace with actual book ID)
2. **Method**: `PUT`
3. **Headers**:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
4. **Body** (form-data):
   - **Key**: `coverImage` (Type: File) | **Value**: Select new image file
   - *(Optional)* Add other fields to update: `title`, `description`, etc.

### Expected Response:

```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "_id": "691e7e77d914693083f812fa",
    "title": "My Awesome Book",
    "image": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v9876543210/book_covers/new123.jpg",
    ...
  }
}
```

### Testing Steps:

1. First, get a book ID from your books (GET `/api/books`)
2. Create a new PUT request in Postman
3. Enter the URL with the book ID
4. Add Authorization header
5. Go to **Body** tab → Select **form-data**
6. Add `coverImage` key with File type
7. Select a new image file
8. Click **Send**
9. Verify new Cloudinary URL in response
10. Check Cloudinary dashboard - old image should be deleted, new image uploaded

### Validation:

- ✅ Old book cover deleted from Cloudinary
- ✅ New book cover uploaded to Cloudinary
- ✅ Book record updated with new `image` URL
- ✅ New image accessible via returned URL

---

## 4. Get User Profile with Avatar

**Purpose**: Retrieve user profile including Cloudinary-hosted avatar

**Endpoint**: `GET /api/users/profile`

**Method**: `GET`

**Authentication**: Required (Bearer Token)

### Postman Configuration:

1. **URL**: `http://localhost:5001/api/users/profile`
2. **Method**: `GET`
3. **Headers**:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`

### Expected Response:

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "691c2a4dec92a7ce9425f23b",
    "name": "Test User",
    "email": "testuser@example.com",
    "avatar": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/profile_images/abc123.jpg",
    "role": "reader",
    ...
  }
}
```

### Testing Steps:

1. Create GET request in Postman
2. Add Authorization header
3. Click **Send**
4. Verify `avatar` field contains Cloudinary URL
5. Copy the avatar URL and open in browser to verify image loads

---

## 5. Get Book Details with Cover Image

**Purpose**: Retrieve book details including Cloudinary-hosted cover image

**Endpoint**: `GET /api/books/:bookId`

**Method**: `GET`

**Authentication**: Optional (required for draft books)

### Postman Configuration:

1. **URL**: `http://localhost:5001/api/books/691e7e77d914693083f812fa`
2. **Method**: `GET`
3. **Headers** (if authenticated):
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`

### Expected Response:

```json
{
  "success": true,
  "message": "Book retrieved successfully",
  "data": {
    "_id": "691e7e77d914693083f812fa",
    "title": "My Awesome Book",
    "image": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/book_covers/xyz789.jpg",
    "author": {
      "name": "Author Name",
      "avatar": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/profile_images/author123.jpg"
    },
    ...
  }
}
```

### Testing Steps:

1. Create GET request in Postman
2. Replace `:bookId` with actual book ID
3. Click **Send**
4. Verify both `image` (book cover) and `author.avatar` contain Cloudinary URLs
5. Open URLs in browser to verify images load correctly

---

## 6. Get Analytics (Top Books with Images)

**Purpose**: Retrieve top books including their Cloudinary cover images

**Endpoint**: `GET /api/analytics/public`

**Method**: `GET`

**Authentication**: Not required (Public endpoint)

### Postman Configuration:

1. **URL**: `http://localhost:5001/api/analytics/public`
2. **Method**: `GET`
3. **Headers**: None required

### Expected Response:

```json
{
  "success": true,
  "message": "Public analytics retrieved successfully.",
  "data": {
    "topBooks": [
      {
        "_id": "691c2df9ec92a7ce9425f25e",
        "title": "The Secrets of TypeScript",
        "image": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/book_covers/abc.jpg",
        "author": {
          "name": "Chhay Lyhour",
          "avatar": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/profile_images/xyz.png"
        },
        "viewCount": 29,
        "totalLikes": 1,
        ...
      }
    ],
    "topAuthors": [
      {
        "authorName": "Chhay Lyhour",
        "authorAvatar": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/profile_images/xyz.png",
        "totalViews": 30,
        "totalLikes": 1,
        ...
      }
    ]
  }
}
```

### Testing Steps:

1. Create GET request in Postman
2. No authentication needed
3. Click **Send**
4. Verify all books have `image` fields with Cloudinary URLs
5. Verify all authors have `avatar` fields with Cloudinary URLs
6. Open several URLs in browser to confirm images load

---

## Common Testing Scenarios

### Scenario 1: Complete User Flow with Images

1. **Register** new user → `POST /api/auth/register`
2. **Login** to get token → `POST /api/auth/login`
3. **Upload profile image** → `PUT /api/users/profile/image`
4. **Create book with cover** → `POST /api/books`
5. **Update book cover** → `PUT /api/books/:bookId`
6. **View profile** → `GET /api/users/profile`
7. **View book** → `GET /api/books/:bookId`

### Scenario 2: Verify Cloudinary Integration

1. Before testing, check Cloudinary dashboard
2. Note the number of images in `profile_images/` and `book_covers/`
3. Upload a profile image
4. Check Cloudinary - count should increase by 1
5. Upload another profile image
6. Check Cloudinary - old image deleted, count stays the same
7. Upload a book cover
8. Check Cloudinary - `book_covers/` count increases

### Scenario 3: Error Handling

**Test Invalid File Type**:
- Try uploading a PDF as profile image
- Expected: Error message about invalid file type

**Test File Too Large**:
- Try uploading image > 5MB
- Expected: Error message about file size

**Test Without Authentication**:
- Try uploading profile image without token
- Expected: 401 Unauthorized error

**Test Wrong Book Owner**:
- User A creates a book
- User B tries to update that book's cover
- Expected: 403 Forbidden error

---

## Verification Checklist

After each upload operation, verify:

- [ ] Response contains Cloudinary URL
- [ ] URL starts with `https://res.cloudinary.com/`
- [ ] Image is accessible via URL in browser
- [ ] Image appears in correct folder in Cloudinary dashboard
- [ ] Old image (if any) was deleted from Cloudinary
- [ ] Database record updated with new URL
- [ ] Image has appropriate dimensions/transformations

---

## Cloudinary Dashboard Verification

1. **Login to Cloudinary**: [https://cloudinary.com/console](https://cloudinary.com/console)
2. **Navigate to Media Library**
3. **Check Folders**:
   - `profile_images/` - Contains user avatars
   - `book_covers/` - Contains book cover images
4. **Verify Image Properties**:
   - Format (should be optimized)
   - Size (should be within limits)
   - Transformations (if applied)
5. **Check Usage**:
   - Storage used
   - Bandwidth used
   - Transformations count

---

## Troubleshooting

### Issue: "Failed to upload image to Cloudinary"

**Solutions**:
- Check `.env` file has correct Cloudinary credentials
- Verify Cloudinary account is active
- Check network connectivity
- Ensure image file is valid and under size limit

### Issue: "Image URL not working"

**Solutions**:
- Verify URL is complete and starts with `https://`
- Check if Cloudinary account has restrictions
- Ensure image wasn't manually deleted from Cloudinary
- Try accessing URL in incognito/private browser window

### Issue: "Old images not being deleted"

**Solutions**:
- Check if `public_id` is being stored correctly
- Verify delete operation in server logs
- Check Cloudinary dashboard for orphaned files
- Ensure proper error handling in upload service

### Issue: "Upload endpoint returns 500 error"

**Solutions**:
- Check server logs for detailed error message
- Verify multer middleware is configured correctly
- Ensure file field name matches in request (`profileImage`, `coverImage`)
- Check file size and type restrictions

---

## API Response Codes

- `200 OK` - Successful upload/update
- `201 Created` - Resource created with image
- `400 Bad Request` - Invalid file type or missing file
- `401 Unauthorized` - Missing or invalid auth token
- `403 Forbidden` - Not authorized to perform action
- `404 Not Found` - Resource not found
- `413 Payload Too Large` - File size exceeds limit
- `500 Internal Server Error` - Server or Cloudinary error

---

## Best Practices for Testing

1. **Start Fresh**: Clear Cloudinary test folders before major testing
2. **Use Test Images**: Use small, valid image files (< 1MB)
3. **Document Results**: Keep track of successful/failed tests
4. **Test Edge Cases**: Try boundary conditions (max file size, unusual formats)
5. **Clean Up**: Delete test data after testing
6. **Monitor Cloudinary**: Keep an eye on storage and bandwidth usage
7. **Test Sequentially**: Complete one flow before moving to next
8. **Save Requests**: Save working requests in Postman collection for reuse

---

## Postman Collection Setup

To save time, create a Postman Collection:

1. **Create Collection**: "Readian API - Cloudinary Tests"
2. **Add Environment Variables**:
   - `baseUrl`: `http://localhost:5001`
   - `accessToken`: (set after login)
   - `bookId`: (set after creating book)
3. **Organize Requests**:
   - Folder: "Authentication"
     - Register
     - Login
   - Folder: "User Profile"
     - Get Profile
     - Update Profile Image
   - Folder: "Books"
     - Create Book with Cover
     - Update Book Cover
     - Get Book Details
   - Folder: "Analytics"
     - Get Public Analytics
4. **Export Collection**: Save for sharing with team

---

## Sample Test Data

### Valid Image Files to Test:
- JPG: Portrait photo (500x500px, ~200KB)
- PNG: Logo with transparency (300x300px, ~150KB)
- GIF: Simple animation (400x400px, ~300KB)

### Invalid Files to Test:
- PDF document
- Text file
- Oversized image (> 5MB)
- Corrupted image file

---

## Summary

This guide covers all Cloudinary-related endpoints in the Readian platform. By following these testing procedures, you can ensure:

✅ Images upload correctly to Cloudinary
✅ Old images are properly deleted
✅ URLs are accessible and images display
✅ Error handling works as expected
✅ Database records are updated correctly
✅ Authentication and authorization work properly

For additional support or questions, refer to the main API documentation or contact the development team.

