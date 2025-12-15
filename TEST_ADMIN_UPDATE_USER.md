# Test Admin Update User

## Endpoint
```
PATCH http://localhost:5001/api/users/691c2a4dec92a7ce9425f23b
```

## Authentication
You need an admin JWT token in the Authorization header:
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

## Test Cases

### Test 1: Update Age
```json
{
  "age": 25
}
```

### Test 2: Update Role
```json
{
  "role": "AUTHOR"
}
```

### Test 3: Update Plan
```json
{
  "plan": "basic"
}
```

### Test 4: Update Subscription Status
```json
{
  "subscriptionStatus": "inactive"
}
```
**Note:** This will automatically clear `subscriptionExpiresAt`, `subscriptionDuration`, and reset `plan` to "free"

### Test 5: Update Subscription Duration
```json
{
  "subscriptionDuration": 90
}
```
**Note:** This will automatically:
- Calculate `subscriptionExpiresAt` to 90 days from now (March 15, 2026)
- Set `subscriptionStatus` to "active"

### Test 6: Grant Premium Subscription for 365 Days
```json
{
  "plan": "premium",
  "subscriptionDuration": 365
}
```
**Result:**
- `plan` = "premium"
- `subscriptionDuration` = 365
- `subscriptionStatus` = "active" (auto-set)
- `subscriptionExpiresAt` = December 15, 2026 (auto-calculated)

### Test 7: Update Multiple Fields at Once
```json
{
  "age": 30,
  "role": "AUTHOR",
  "plan": "premium",
  "subscriptionDuration": 180
}
```

### Test 8: Deactivate Subscription But Keep Age
```json
{
  "age": 28,
  "subscriptionStatus": "inactive"
}
```
**Result:**
- `age` = 28 (updated)
- `subscriptionStatus` = "inactive"
- `subscriptionExpiresAt` = null (auto-cleared)
- `subscriptionDuration` = null (auto-cleared)
- `plan` = "free" (auto-reset)

## Current User Data
```json
{
  "_id": "691c2a4dec92a7ce9425f23b",
  "name": "Chhay Lyhour",
  "age": 17,
  "role": "ADMIN",
  "plan": "premium",
  "subscriptionStatus": "active",
  "subscriptionDuration": 30,
  "subscriptionExpiresAt": "2026-01-14T06:45:40.032Z"
}
```

## How to Test in Postman

1. **Method:** PATCH
2. **URL:** `http://localhost:5001/api/users/691c2a4dec92a7ce9425f23b`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
4. **Body:** (raw JSON) - Choose one of the test cases above
5. **Send** and check the response

## Expected Success Response
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "_id": "691c2a4dec92a7ce9425f23b",
    "name": "Chhay Lyhour",
    "email": "chhaylyhour425@gmail.com",
    "age": 25,
    "role": "AUTHOR",
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionDuration": 90,
    "subscriptionExpiresAt": "2026-03-15T...",
    // ... other fields
  }
}
```

## Validation Errors

### Invalid Age
```json
{
  "age": 200
}
```
**Error:** "Age cannot exceed 150"

### Invalid Role
```json
{
  "role": "SUPERUSER"
}
```
**Error:** Invalid enum value. Expected 'READER' | 'AUTHOR' | 'ADMIN'

### Invalid Plan
```json
{
  "plan": "platinum"
}
```
**Error:** Invalid enum value. Expected 'free' | 'basic' | 'premium'

### Invalid Subscription Status
```json
{
  "subscriptionStatus": "pending"
}
```
**Error:** Invalid enum value. Expected 'active' | 'inactive'

### Invalid Subscription Duration
```json
{
  "subscriptionDuration": 0
}
```
**Error:** "Subscription duration must be at least 1 day"

## Quick Copy-Paste for Postman

**URL:**
```
http://localhost:5001/api/users/691c2a4dec92a7ce9425f23b
```

**Body (Update age and extend subscription):**
```json
{
  "age": 25,
  "subscriptionDuration": 90
}
```

## ✅ All Fields That Can Be Updated

- ✅ `age` - User's age (0-150)
- ✅ `role` - User role (READER, AUTHOR, ADMIN)
- ✅ `plan` - Subscription plan (free, basic, premium)
- ✅ `subscriptionStatus` - Subscription status (active, inactive)
- ✅ `subscriptionDuration` - Duration in days (min 1)

**Bonus fields also available:**
- `name` - User's display name
- `avatar` - Profile image URL
- `bio` - User biography (max 500 chars)
- `email_verified` - Email verification status (boolean)

All fields are optional - update just what you need! 🚀

