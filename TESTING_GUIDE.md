# API Testing Guide - Fixed Endpoints

## Quick Test Guide for All Fixed Features

---

## 1. Test Author Stats (Enhanced)

**Endpoint**: `GET /api/users/me/author-stats`

**Setup**:
1. Login as an AUTHOR
2. Create at least 5 books (3 published, 2 drafts)
3. Add various chapters to books

**Test**:
```bash
GET http://localhost:5001/api/users/me/author-stats
Authorization: Bearer <author_access_token>
```

**Expected Response**:
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

**Verify**:
- ✅ `stats` object wrapper exists
- ✅ All 6 fields are present
- ✅ `publishedBooks` + `draftBooks` = `totalBooks`
- ✅ `totalChapters` counts ALL chapters from ALL books

---

## 2. Test Liked Books Pagination (New Feature)

**Endpoint**: `GET /api/users/me/liked-books`

**Setup**:
1. Login as a user
2. Like at least 15 books

**Test Cases**:

### Test A: First Page
```bash
GET http://localhost:5001/api/users/me/liked-books?page=1&limit=10
Authorization: Bearer <access_token>
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Liked books retrieved successfully.",
  "data": {
    "likedBooks": [
      {
        "_id": "...",
        "title": "Book Title",
        "author": {
          "_id": "...",
          "name": "Author Name",
          "avatar": "/uploads/profile_images/avatar.jpg"
        },
        "genre": "Fantasy",
        "image": "/uploads/book_covers/cover.jpg",
        "likes": 100,
        "viewCount": 500,
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

### Test B: Last Page
```bash
GET http://localhost:5001/api/users/me/liked-books?page=2&limit=10
```

**Verify**:
- ✅ `hasMore` = false on last page
- ✅ Returns remaining books (5 books)

### Test C: Custom Limit
```bash
GET http://localhost:5001/api/users/me/liked-books?page=1&limit=5
```

**Verify**:
- ✅ Returns exactly 5 books
- ✅ `totalPages` = 3 (15 books ÷ 5 per page)

---

## 3. Test Admin Analytics with Revenue

**Endpoint**: `GET /api/admin/analytics`

**Setup**:
1. Login as ADMIN
2. Have users with different subscription plans
3. Activate some subscriptions this month

**Test**:
```bash
GET http://localhost:5001/api/admin/analytics
Authorization: Bearer <admin_access_token>
```

**Expected Response Structure**:
```json
{
  "success": true,
  "message": "Analytics retrieved successfully.",
  "data": {
    "totalUsers": 100,
    "totalBooks": 50,
    "publishedBooks": 40,
    "draftBooks": 10,
    "totalChapters": 500,
    "totalLikes": 1500,
    "totalViews": 25000,
    "basicSubscribers": 10,
    "premiumSubscribers": 5,
    "freeUsers": 85,
    "revenueThisMonth": 100,
    "users": {
      "total": 100,
      "roles": {
        "READER": 70,
        "AUTHOR": 28,
        "ADMIN": 2
      },
      "subscriptionBreakdown": {
        "basicSubscribers": 10,
        "premiumSubscribers": 5,
        "freeUsers": 85
      }
    },
    "books": {
      "total": 50,
      "status": {
        "published": 40,
        "draft": 10
      },
      "premium": 15,
      "totalViews": 25000,
      "totalLikes": 1500
    },
    "detailed": {
      "newUsersLast30Days": [...],
      "topBooks": [...],
      "topAuthors": [...]
    }
  }
}
```

**Revenue Calculation Verification**:
- If `basicSubscribers` = 10: 10 × $5 = $50
- If `premiumSubscribers` = 5: 5 × $10 = $50
- Total `revenueThisMonth` should = $100

**Verify**:
- ✅ All flat top-level fields exist
- ✅ `basicSubscribers` + `premiumSubscribers` + `freeUsers` = `totalUsers`
- ✅ `publishedBooks` + `draftBooks` = `totalBooks`
- ✅ Revenue = (basicSubscribers × 5) + (premiumSubscribers × 10)
- ✅ Detailed nested structure exists

---

## 4. Test Pagination on Books Endpoints

### Test A: All Books
```bash
GET http://localhost:5001/api/books?page=1&limit=10
```

**Expected**:
```json
{
  "success": true,
  "message": "Books retrieved successfully.",
  "data": {
    "books": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalBooks": 45,
      "hasMore": true
    }
  }
}
```

### Test B: Search Books
```bash
GET http://localhost:5001/api/books/search?title=fantasy&page=1&limit=10
```

**Verify**:
- ✅ `pagination` object exists
- ✅ `hasMore` field is present and correct

### Test C: Author's Books
```bash
GET http://localhost:5001/api/users/me/books?page=1&limit=10
Authorization: Bearer <author_access_token>
```

**Verify**:
- ✅ Consistent pagination structure across all endpoints

---

## 5. Test Reading Time Auto-Calculation

### Test A: Create Book
**Endpoint**: `POST /api/books`

**Request**:
```json
{
  "title": "Test Book",
  "genre": "Fantasy",
  "chapters": [
    {
      "title": "Chapter 1",
      "content": "This is a very long chapter content with at least 500 words to test reading time calculation. Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
    }
  ]
}
```

**Verify**:
- ✅ Response includes `readingTime` field
- ✅ Reading time is calculated (e.g., "3 min read")

### Test B: Add Chapter
**Endpoint**: `POST /api/books/:bookId/chapters`

**Request**:
```json
{
  "title": "Chapter 2",
  "content": "Another long chapter with at least 500 words..."
}
```

**Then Get Book**:
```bash
GET http://localhost:5001/api/books/:bookId
```

**Verify**:
- ✅ `readingTime` has increased
- ✅ Reflects total content from all chapters

### Test C: Update Chapter Content
**Endpoint**: `PATCH /api/books/:bookId/chapters/1`

**Request**:
```json
{
  "content": "Much shorter content now."
}
```

**Verify**:
- ✅ `readingTime` has decreased

### Test D: Delete Chapter
**Endpoint**: `DELETE /api/books/:bookId/chapters/1`

**Verify**:
- ✅ `readingTime` is recalculated without deleted chapter

---

## 6. Test Chapter Reordering (Bug Fixed)

**Endpoint**: `POST /api/books/:bookId/chapters/reorder`

**Setup**:
1. Create a book with 5 chapters
2. Verify initial order: 1, 2, 3, 4, 5

**Test Cases**:

### Test A: Simple Reorder
**Request**:
```json
{
  "chapterOrder": [3, 1, 2, 4, 5]
}
```

**Expected Outcome**:
- Old Chapter 3 → New Chapter 1
- Old Chapter 1 → New Chapter 2
- Old Chapter 2 → New Chapter 3
- Old Chapter 4 → New Chapter 4
- Old Chapter 5 → New Chapter 5

**Verify**:
```bash
GET http://localhost:5001/api/books/:bookId/chapters
```

Check that chapters are in the new order.

### Test B: Reverse Order
**Request**:
```json
{
  "chapterOrder": [5, 4, 3, 2, 1]
}
```

**Verify**:
- ✅ No duplicate chapter number errors
- ✅ All chapters reordered correctly
- ✅ No chapters lost

### Test C: Invalid Order (Should Fail)
**Request**:
```json
{
  "chapterOrder": [1, 2, 3]
}
```

**Expected**: Error (chapter count mismatch)

### Test D: Duplicate Numbers (Should Fail)
**Request**:
```json
{
  "chapterOrder": [1, 1, 2, 3, 4]
}
```

**Expected**: Error (invalid chapter order)

---

## 7. Test Public Analytics

**Endpoint**: `GET /api/analytics/public`

**Test**:
```bash
GET http://localhost:5001/api/analytics/public
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Public analytics retrieved successfully.",
  "data": {
    "topBooks": [
      {
        "_id": "...",
        "title": "Most Popular Book",
        "viewCount": 15420,
        "likes": 234,
        "author": {
          "_id": "...",
          "name": "Popular Author",
          "email": "author@example.com",
          "avatar": "/uploads/profile_images/avatar.jpg"
        },
        "image": "/uploads/book_covers/cover.jpg",
        "genre": "Fantasy",
        "isPremium": false,
        "publishedDate": "2025-01-01T00:00:00.000Z"
      }
    ],
    "topAuthors": [
      {
        "authorId": "...",
        "authorName": "Top Author",
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

**Verify**:
- ✅ Returns top 5 books by viewCount
- ✅ Returns top 5 authors by totalViews
- ✅ No aggregate counts (totalBooks, totalUsers, etc.)

---

## Quick Checklist

### Before Testing:
- [ ] Start MongoDB server
- [ ] Start the backend server (`npm run dev`)
- [ ] Have test data (users, books, chapters)
- [ ] Have tokens for READER, AUTHOR, and ADMIN

### Tests to Run:
- [ ] Author stats with all 6 fields
- [ ] Liked books pagination (page 1, page 2, custom limit)
- [ ] Admin analytics with revenue calculation
- [ ] All paginated endpoints have `hasMore` field
- [ ] Reading time auto-calculates on create/update/delete
- [ ] Chapter reordering works without errors
- [ ] Public analytics returns topBooks and topAuthors

### Success Criteria:
- ✅ No errors in console
- ✅ All responses match documentation
- ✅ Pagination works correctly
- ✅ Revenue calculation is accurate
- ✅ Reading time updates automatically
- ✅ Chapter reordering completes successfully

---

## Common Issues & Solutions

### Issue 1: "Chapter order array length must match"
**Cause**: Trying to reorder with wrong number of chapters
**Solution**: Ensure `chapterOrder` array has exactly the same number as existing chapters

### Issue 2: Revenue is 0 despite having subscribers
**Cause**: Subscriptions were not activated this month
**Solution**: Activate new subscriptions in the current month to see revenue

### Issue 3: Reading time not updating
**Cause**: Not enough content in chapters
**Solution**: Add substantial content (at least 225 words) to see meaningful reading time

### Issue 4: Pagination returns wrong hasMore value
**Cause**: Data issue
**Solution**: Verify `totalPages` and `currentPage` calculation

---

## Postman Collection Tips

1. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:5001/api`
   - `readerToken`: Login as READER and save token
   - `authorToken`: Login as AUTHOR and save token
   - `adminToken`: Login as ADMIN and save token

2. **Pre-request Scripts**:
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.environment.get('authorToken')
   });
   ```

3. **Test Scripts** (verify responses):
   ```javascript
   pm.test("Status code is 200", function () {
     pm.response.to.have.status(200);
   });
   
   pm.test("Has pagination object", function () {
     var jsonData = pm.response.json();
     pm.expect(jsonData.data).to.have.property('pagination');
   });
   
   pm.test("Pagination has hasMore field", function () {
     var jsonData = pm.response.json();
     pm.expect(jsonData.data.pagination).to.have.property('hasMore');
   });
   ```

---

## Report Results

After testing, note any issues:
1. Endpoint URL
2. Expected vs Actual response
3. Error messages
4. Console logs

Good luck with testing! 🚀

