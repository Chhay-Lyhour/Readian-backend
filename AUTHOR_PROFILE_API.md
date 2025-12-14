# 📝 Author Profile API Documentation
## Overview
Public API endpoint to view author profiles including their name, image, bio, statistics, and all their published books.
**Endpoint:** `GET /api/authors/:authorId`
**Access:** Public (no authentication required)
---
## 🚀 Quick Start
### Basic Request
```bash
GET http://localhost:5001/api/authors/{authorId}
```
### Example with cURL
```bash
curl http://localhost:5001/api/authors/507f1f77bcf86cd799439011
```
### Example with Pagination
```bash
curl "http://localhost:5001/api/authors/507f1f77bcf86cd799439011?page=1&limit=10"
```
---
## 📋 Request Parameters
### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `authorId` | String (ObjectId) | Yes | The MongoDB ObjectId of the author |
### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | 1 | Page number for pagination |
| `limit` | Number | No | 10 | Number of books per page (max: 100) |
---
## ✅ Success Response
**Status Code:** `200 OK`
**Response Format:**
```json
{
  "status": "success",
  "message": "Author profile retrieved successfully.",
  "data": {
    "author": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "coverImage": "https://example.com/cover.jpg",
      "bio": "Bestselling author of fantasy novels...",
      "role": "AUTHOR",
      "createdAt": "2023-01-15T10:30:00.000Z"
    },
    "stats": {
      "totalBooks": 12,
      "totalViews": 45678,
      "totalLikes": 3456,
      "averageRating": 4.5
    },
    "books": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "The Dragon's Quest",
        "description": "An epic fantasy adventure...",
        "genre": "Fantasy",
        "tags": "fantasy, adventure, dragons",
        "image": "https://example.com/book-cover.jpg",
        "isPremium": false,
        "likes": 245,
        "likedBy": ["userId1", "userId2"],
        "totalLikes": 245,
        "viewCount": 5678,
        "averageRating": 4.7,
        "totalRatings": 123,
        "publishedDate": "2024-06-15T00:00:00.000Z",
        "createdAt": "2024-05-01T10:30:00.000Z",
        "bookStatus": "finished",
        "contentType": "kids",
        "totalChapters": 25
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalBooks": 12,
      "hasMore": true
    }
  }
}
```
---
## ❌ Error Responses
### Author Not Found
**Status Code:** `404 Not Found`
```json
{
  "status": "error",
  "message": "Author not found.",
  "statusCode": 404
}
```
### Not an Author
**Status Code:** `404 Not Found`
```json
{
  "status": "error",
  "message": "This user is not an author.",
  "statusCode": 404
}
```
### Invalid Author ID
**Status Code:** `400 Bad Request`
```json
{
  "status": "error",
  "message": "Invalid author ID format.",
  "statusCode": 400
}
```
---
## 📊 Response Fields Explained
### Author Object
| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Author's unique ID |
| `name` | String | Author's display name |
| `email` | String | Author's email address |
| `avatar` | String | URL to profile image |
| `coverImage` | String | URL to cover image |
| `bio` | String | Author's biography |
| `role` | String | User role (AUTHOR or ADMIN) |
| `createdAt` | Date | Account creation date |
### Stats Object
| Field | Type | Description |
|-------|------|-------------|
| `totalBooks` | Number | Total published books |
| `totalViews` | Number | Sum of views across all books |
| `totalLikes` | Number | Sum of likes across all books |
| `averageRating` | Number | Average rating across all books (0-5) |
### Book Object
| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Book's unique ID |
| `title` | String | Book title |
| `description` | String | Book description |
| `genre` | String | Book genre |
| `tags` | String | Book tags (comma-separated) |
| `image` | String | Book cover image URL |
| `isPremium` | Boolean | Whether book requires premium subscription |
| `totalLikes` | Number | Number of likes |
| `viewCount` | Number | Number of views |
| `averageRating` | Number | Average rating (0-5) |
| `totalRatings` | Number | Number of ratings |
| `publishedDate` | Date | Publication date |
| `bookStatus` | String | "ongoing" or "finished" |
| `contentType` | String | "kids" or "adult" |
| `totalChapters` | Number | Number of chapters |
### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| `currentPage` | Number | Current page number |
| `totalPages` | Number | Total number of pages |
| `totalBooks` | Number | Total number of books |
| `hasMore` | Boolean | Whether more pages exist |
---
## 🧪 Testing Examples
### Test with Browser
Just paste in your browser:
```
http://localhost:5001/api/authors/507f1f77bcf86cd799439011
```
### Test with cURL
```bash
# Get author profile
curl http://localhost:5001/api/authors/507f1f77bcf86cd799439011
# Get page 2 with 5 books per page
curl "http://localhost:5001/api/authors/507f1f77bcf86cd799439011?page=2&limit=5"
# Pretty print JSON (requires jq)
curl http://localhost:5001/api/authors/507f1f77bcf86cd799439011 | jq
```
### Test with JavaScript (fetch)
```javascript
// Get author profile
fetch('http://localhost:5001/api/authors/507f1f77bcf86cd799439011')
  .then(res => res.json())
  .then(data => {
    console.log('Author:', data.data.author.name);
    console.log('Books:', data.data.books.length);
    console.log('Total Views:', data.data.stats.totalViews);
  });
// With pagination
fetch('http://localhost:5001/api/authors/507f1f77bcf86cd799439011?page=1&limit=5')
  .then(res => res.json())
  .then(data => console.log(data));
```
### Test with Postman
1. **Method:** GET
2. **URL:** `http://localhost:5001/api/authors/507f1f77bcf86cd799439011`
3. **Params (optional):**
   - `page`: 1
   - `limit`: 10
---
## 💡 Use Cases
### 1. Author Profile Page
Display author information and their book catalog:
```javascript
const authorId = "507f1f77bcf86cd799439011";
const response = await fetch(`/api/authors/${authorId}?page=1&limit=10`);
const { data } = await response.json();
// Display author info
console.log(data.author.name);
console.log(data.author.bio);
console.log(data.stats.totalBooks);
// Display books
data.books.forEach(book => {
  console.log(book.title, book.totalChapters + ' chapters');
});
```
### 2. Pagination Example
```javascript
const loadMoreBooks = async (authorId, page) => {
  const response = await fetch(
    `/api/authors/${authorId}?page=${page}&limit=10`
  );
  const { data } = await response.json();
  if (data.pagination.hasMore) {
    console.log('Load more available');
  } else {
    console.log('All books loaded');
  }
  return data.books;
};
```
### 3. Author Card Component
```javascript
const AuthorCard = ({ authorId }) => {
  const [author, setAuthor] = useState(null);
  useEffect(() => {
    fetch(`/api/authors/${authorId}`)
      .then(res => res.json())
      .then(data => setAuthor(data.data));
  }, [authorId]);
  if (!author) return <Loading />;
  return (
    <div>
      <img src={author.author.avatar} alt={author.author.name} />
      <h2>{author.author.name}</h2>
      <p>{author.author.bio}</p>
      <p>{author.stats.totalBooks} books</p>
      <p>{author.stats.totalViews.toLocaleString()} views</p>
    </div>
  );
};
```
---
## 🔍 Filtering & Sorting
**Current Implementation:**
- Books are sorted by `publishedDate` (newest first)
- Only **published** books are shown
- Pagination supported
**Future Enhancements:**
- Sort by: popularity, rating, title
- Filter by: genre, content type, premium status
---
## ⚡ Performance Notes
- **Response Time:** < 500ms typical
- **Caching:** Consider caching author profiles (TTL: 5-10 minutes)
- **Indexes:** MongoDB indexes on `author` and `status` fields
- **Pagination:** Use for authors with many books
---
## 🔗 Related Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /api/books` | Get all books |
| `GET /api/books/:id` | Get single book details |
| `GET /api/analytics/public` | Get top authors |
| `GET /api/users/me/author-stats` | Get own author stats (protected) |
---
## 📝 Notes
- **Public Access:** No authentication required
- **Privacy:** Email is included (consider removing in production)
- **Only Authors:** Non-authors will return 404
- **Published Only:** Only published books are shown
- **Statistics:** Calculated in real-time from all published books
---
## ✅ Testing Checklist
- [ ] Test with valid author ID
- [ ] Test with invalid author ID (should return 400)
- [ ] Test with non-existent author ID (should return 404)
- [ ] Test with non-author user ID (should return 404)
- [ ] Test pagination (page 1, 2, 3)
- [ ] Test with different limit values (1, 10, 50, 100)
- [ ] Test with limit > 100 (should cap at 100)
- [ ] Verify books are sorted by publishedDate DESC
- [ ] Verify only published books are shown
- [ ] Verify stats calculation is correct
- [ ] Test response time (should be fast)
---
## 🎯 Quick Reference
**URL Pattern:**
```
GET /api/authors/:authorId?page={page}&limit={limit}
```
**Example:**
```
GET /api/authors/507f1f77bcf86cd799439011?page=1&limit=10
```
**Response:**
- ✅ 200: Success with author profile and books
- ❌ 400: Invalid author ID format
- ❌ 404: Author not found or not an author
---
**Ready to use! 🚀** Test it now with your author IDs!
