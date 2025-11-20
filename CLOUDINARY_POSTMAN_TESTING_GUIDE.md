# 📸 Cloudinary Image Upload Testing Guide - Postman

This guide will help you test all Cloudinary image upload endpoints in your Readian Backend API using Postman.

---

## 🚀 Prerequisites

### 1. Start the Server
```bash
npm start
# or
node src/server.js
```

### 2. Verify Cloudinary Configuration
Check your `.env` file has these variables set:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔐 Authentication Setup

All upload endpoints require authentication. You need to get a JWT token first.

### Step 1: Register a User (if you don't have an account)
- **URL**: `http://localhost:5001/api/auth/register`
- **Method**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }
  ```

### Step 2: Verify Email
Check your email for the verification code, then:
- **URL**: `http://localhost:5001/api/auth/verify-email`
- **Method**: `POST`
- **Body** (raw JSON):
  ```json
  {
    "email": "testuser@example.com",
    "code": "123456"
  }
  ```

### Step 3: Login to Get Access Token
- **URL**: `http://localhost:5001/api/auth/login`
- **Method**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "testuser@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: Copy the `accessToken` from the response
  ```json
  {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "..."
    }
  }
  ```

### Step 4: Set Authorization Header
For all subsequent requests, add this header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

---

## 📋 Image Upload Endpoints

### 1. ✅ Upload User Profile Image (Avatar)

**Endpoint**: `PATCH /api/users/me/profile-image`

**Setup in Postman**:
1. **Method**: `PATCH`
2. **URL**: `http://localhost:5001/api/users/me/profile-image`
3. **Headers**:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```
4. **Body**:
   - Select `form-data`
   - Add a field:
     - **Key**: `avatar` (set type to `File`)
     - **Value**: Click "Select Files" and choose an image (JPG, PNG, etc.)

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile image updated successfully.",
  "data": {
    "_id": "user_id_here",
    "name": "Test User",
    "email": "testuser@example.com",
    "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/profile_images/abc123.jpg",
    "role": "AUTHOR",
    ...
  }
}
```

**Cloudinary Folder**: `profile_images`

**Verification**:
- Copy the `avatar` URL from the response
- Paste it in a browser - you should see your uploaded image
- Log into Cloudinary Dashboard → Media Library → `profile_images` folder

---

### 2. 🆕 Upload User Cover Image

**Endpoint**: `PATCH /api/users/me/cover-image`

**Setup in Postman**:
1. **Method**: `PATCH`
2. **URL**: `http://localhost:5001/api/users/me/cover-image`
3. **Headers**:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```
4. **Body**:
   - Select `form-data`
   - Add a field:
     - **Key**: `coverImage` (set type to `File`)
     - **Value**: Click "Select Files" and choose an image

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Cover image updated successfully.",
  "data": {
    "_id": "user_id_here",
    "name": "Test User",
    "email": "testuser@example.com",
    "avatar": "...",
    "coverImage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/cover_images/xyz789.jpg",
    "role": "AUTHOR",
    ...
  }
}
```

**Cloudinary Folder**: `cover_images`

---

### 3. 📚 Upload Book Cover Image (Create Book)

**Note**: You need to be an **AUTHOR** or **ADMIN** to create books.

**Upgrade to Author** (if needed):
- **URL**: `http://localhost:5001/api/users/me/become-author`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Create Book with Cover Image**:

**Endpoint**: `POST /api/books`

**Setup in Postman**:
1. **Method**: `POST`
2. **URL**: `http://localhost:5001/api/books`
3. **Headers**:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```
4. **Body**:
   - Select `form-data`
   - Add these fields:
     
     | Key | Type | Value |
     |-----|------|-------|
     | `title` | Text | "My Awesome Book" |
     | `description` | Text | "A great book about coding" |
     | `genre` | Text | "Technology" |
     | `image` | File | Select an image file |
     | `chapters[0][title]` | Text | "Chapter 1: Introduction" |
     | `chapters[0][content]` | Text | "This is the first chapter..." |

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Book created successfully.",
  "data": {
    "_id": "book_id_here",
    "title": "My Awesome Book",
    "description": "A great book about coding",
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book_covers/book123.jpg",
    "author": "user_id_here",
    "genre": "Technology",
    "status": "draft",
    ...
  }
}
```

**Cloudinary Folder**: `book_covers`

---

### 4. 📝 Update Book Cover Image

**Endpoint**: `PATCH /api/books/:id`

**Setup in Postman**:
1. **Method**: `PATCH`
2. **URL**: `http://localhost:5001/api/books/YOUR_BOOK_ID_HERE`
3. **Headers**:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```
4. **Body**:
   - Select `form-data`
   - Add fields you want to update:
     
     | Key | Type | Value |
     |-----|------|-------|
     | `image` | File | Select a new image file |
     | `title` | Text | "Updated Book Title" (optional) |
     | `description` | Text | "Updated description" (optional) |

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Book updated successfully.",
  "data": {
    "_id": "book_id_here",
    "title": "Updated Book Title",
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book_covers/updated_book.jpg",
    ...
  }
}
```

**Cloudinary Folder**: `book_covers`

---

## ❌ Error Scenarios to Test

### 1. No File Provided
**Test**: Send request without selecting a file

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "No file was provided.",
  "error": {
    "code": "FILE_NOT_PROVIDED",
    "statusCode": 400
  }
}
```

### 2. File Too Large
**Test**: Try uploading a file larger than 5MB

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "File size is too large. Maximum size is 5MB.",
  "error": {
    "code": "FILE_TOO_LARGE",
    "statusCode": 400
  }
}
```

### 3. Invalid File Type
**Test**: Try uploading a non-image file (e.g., PDF, TXT)

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid file type. Only images are allowed.",
  "error": {
    "code": "INVALID_FILE_TYPE",
    "statusCode": 400
  }
}
```

### 4. No Authentication Token
**Test**: Send request without Authorization header

**Expected Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "Authentication token is invalid or missing.",
  "error": {
    "code": "TOKEN_INVALID",
    "statusCode": 401
  }
}
```

---

## 🔍 Verification Checklist

After uploading images, verify:

### ✅ In Response
- [ ] Response status is `200 OK`
- [ ] `success` field is `true`
- [ ] Image URL is present and starts with `https://res.cloudinary.com/`
- [ ] URL contains the correct folder name (e.g., `profile_images`, `book_covers`)

### ✅ In Browser
- [ ] Copy the image URL from response
- [ ] Paste URL in browser
- [ ] Image loads correctly

### ✅ In Cloudinary Dashboard
- [ ] Login to [Cloudinary Dashboard](https://cloudinary.com/console)
- [ ] Go to Media Library
- [ ] Check the appropriate folder:
  - `profile_images` - for profile avatars
  - `cover_images` - for user cover images
  - `book_covers` - for book cover images
- [ ] Verify the uploaded image is there

### ✅ In Database
- [ ] Use MongoDB Compass or mongosh
- [ ] Check the user/book document
- [ ] Verify the URL is saved in the correct field:
  - `avatar` field for profile images
  - `coverImage` field for cover images
  - `image` field for book covers

---

## 🎯 Quick Test Checklist

Use this checklist to ensure everything works:

- [ ] **Profile Image Upload**: `PATCH /api/users/me/profile-image` ✅
- [ ] **Cover Image Upload**: `PATCH /api/users/me/cover-image` ✅
- [ ] **Book Cover Upload (Create)**: `POST /api/books` ✅
- [ ] **Book Cover Upload (Update)**: `PATCH /api/books/:id` ✅
- [ ] **Error Handling**: No file provided ❌
- [ ] **Error Handling**: File too large ❌
- [ ] **Error Handling**: Invalid file type ❌
- [ ] **Cloudinary Verification**: Images visible in Cloudinary Dashboard ✅
- [ ] **URL Verification**: Image URLs work in browser ✅

---

## 💡 Tips & Best Practices

### Supported Image Formats
- JPG/JPEG
- PNG
- GIF
- WebP
- BMP

### File Size Limit
- **Maximum**: 5 MB per file
- For larger files, you'll need to increase the limit in `uploadMiddleware.js`

### Cloudinary URL Structure
```
https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
```

### Testing Multiple Users
1. Create multiple user accounts
2. Login with each to get separate tokens
3. Upload different images for each user
4. Verify images don't overlap

### Testing Author-Only Features
1. Register as a regular user
2. Call `POST /api/users/me/become-author` to upgrade
3. Then you can create/update books

---

## 🐛 Troubleshooting

### Issue: "Cloudinary is not configured"
**Solution**: Check your `.env` file has all Cloudinary variables set correctly

### Issue: "File upload error"
**Solution**: 
1. Check your internet connection
2. Verify Cloudinary credentials are correct
3. Check Cloudinary dashboard for any issues with your account

### Issue: "Token expired"
**Solution**: Login again to get a new access token

### Issue: "Insufficient permissions"
**Solution**: 
- For book uploads, ensure you're an AUTHOR or ADMIN
- Call the become-author endpoint first

### Issue: Images not showing in Cloudinary
**Solution**: 
1. Check if Cloudinary is configured (check console logs)
2. If Cloudinary is not configured, images are saved locally in `/uploads` folder
3. Set up Cloudinary environment variables to use cloud storage

---

## 📊 Example Postman Collection

You can import this collection structure into Postman:

```
Readian API - Cloudinary Tests
├── Auth
│   ├── Register
│   ├── Verify Email
│   ├── Login
│   └── Become Author
├── User Images
│   ├── Upload Profile Image
│   └── Upload Cover Image
└── Book Images
    ├── Create Book with Cover
    └── Update Book Cover
```

---

## 🎓 Next Steps

1. Test all endpoints one by one
2. Verify images in Cloudinary Dashboard
3. Test error scenarios
4. Try uploading different image formats
5. Test with multiple user accounts

---

**Happy Testing! 🚀**

If you encounter any issues, check the server logs for detailed error messages.

