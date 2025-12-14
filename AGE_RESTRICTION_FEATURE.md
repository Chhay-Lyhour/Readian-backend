# Age Restriction Feature for Adult Content Creation

## Overview
This feature prevents underage authors (users under 18 years old) from creating or updating books with adult content type.

## Implementation Details

### Files Modified

1. **src/services/bookService.js**
   - Modified `createBook()` - Validates author age before creating adult content
   - Modified `updateBookById()` - Validates author age before updating to adult content  
   - Modified `updateContentType()` - Validates author age before changing content type to adult

2. **src/utils/errorHandler.js**
   - Added `AGE_RESTRICTION` error code (403 status)
   - Added `AUTHOR_NOT_FOUND` error code (404 status)

### Business Logic

**Age Validation Rules:**
- Authors must be **18 years or older** to create adult content
- The validation checks the `age` field in the User model
- If age is not set (null/undefined), the validation allows the action (assumes age is set only when user provides it)
- If age is set AND less than 18, the creation/update is blocked

### Error Response

When an underage author tries to create adult content:

```json
{
  "status": "error",
  "message": "Authors under 18 years old cannot create adult content.",
  "statusCode": 403
}
```

## API Endpoints Affected

### 1. POST /api/books (Create Book)
**Validation:** Checks if `contentType` is "adult" and author is under 18

**Example Request:**
```json
{
  "title": "Adult Book Title",
  "description": "This is an adult book",
  "contentType": "adult",
  "chapters": [
    {
      "title": "Chapter 1",
      "content": "Chapter content here"
    }
  ]
}
```

**Response (if author is under 18):**
```json
{
  "status": "error",
  "message": "Authors under 18 years old cannot create adult content.",
  "statusCode": 403
}
```

### 2. PATCH /api/books/:id (Update Book)
**Validation:** Checks if `contentType` is being updated to "adult" and author is under 18

**Example Request:**
```json
{
  "contentType": "adult"
}
```

### 3. PATCH /api/books/:id/content-type (Update Content Type)
**Validation:** Checks if new `contentType` is "adult" and author is under 18

**Example Request:**
```json
{
  "contentType": "adult"
}
```

## Testing Scenarios

### Test Case 1: Underage Author Creates Kids Book ✅
- **Setup:** Author age = 16
- **Action:** Create book with `contentType: "kids"`
- **Expected:** Book created successfully

### Test Case 2: Underage Author Creates Adult Book ❌
- **Setup:** Author age = 16  
- **Action:** Create book with `contentType: "adult"`
- **Expected:** Error 403 - "Authors under 18 years old cannot create adult content."

### Test Case 3: Adult Author Creates Adult Book ✅
- **Setup:** Author age = 25
- **Action:** Create book with `contentType: "adult"`
- **Expected:** Book created successfully

### Test Case 4: Underage Author Updates to Adult Content ❌
- **Setup:** Author age = 17, existing book with `contentType: "kids"`
- **Action:** Update book `contentType` to "adult"
- **Expected:** Error 403 - "Authors under 18 years old cannot create adult content."

### Test Case 5: Author Without Age Set ✅
- **Setup:** Author age = null/undefined
- **Action:** Create book with `contentType: "adult"`
- **Expected:** Book created successfully (assumes age verification happens separately)

## Database Schema

### User Model (age field)
```javascript
age: {
  type: Number,
  min: 0,
  max: 150,
  required: false, // Optional field
}
```

### Book Model (contentType field)
```javascript
contentType: {
  type: String,
  enum: ["kids", "adult"],
  default: "kids",
  required: true,
}
```

## Manual Testing with Postman/curl

### 1. Create a test user with age < 18
```bash
POST /api/auth/register
{
  "name": "Young Author",
  "email": "young@example.com",
  "password": "password123",
  "age": 16,
  "role": "AUTHOR"
}
```

### 2. Try to create an adult book (should fail)
```bash
POST /api/books
Headers: Authorization: Bearer <token>
{
  "title": "Adult Book",
  "description": "This is adult content",
  "contentType": "adult",
  "chapters": [
    {
      "title": "Chapter 1",
      "content": "Content here"
    }
  ]
}
```

### 3. Create a kids book (should succeed)
```bash
POST /api/books
Headers: Authorization: Bearer <token>
{
  "title": "Kids Book",
  "description": "This is kids content",
  "contentType": "kids",
  "chapters": [
    {
      "title": "Chapter 1",
      "content": "Content here"
    }
  ]
}
```

## Notes

- The age field must be set in the user profile for the restriction to take effect
- If the user doesn't have an age set, they can create any content type
- This is a backend validation - frontend should also implement UI restrictions for better UX
- Consider implementing age verification workflows for users who want to create adult content

