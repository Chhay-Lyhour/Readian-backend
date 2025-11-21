# Testing Subscription Duration Feature

## Prerequisites
- Server running on http://localhost:5001
- Valid user account with email verified
- Access token (from login)

## Test Scenarios

### 1. Test Default Duration (30 days)

**Request:**
```bash
POST http://localhost:5001/api/subscriptions/activate
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "plan": "premium"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription activated successfully for the premium plan (30 days).",
  "data": {
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2025-12-21T...",
    "subscriptionDuration": 30
  }
}
```

**Verify:**
- ✅ subscriptionDuration is 30
- ✅ subscriptionExpiresAt is 30 days from now
- ✅ subscriptionStatus is "active"
- ✅ plan is "premium"

---

### 2. Test Custom Duration (90 days)

**Request:**
```bash
POST http://localhost:5001/api/subscriptions/activate
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "plan": "basic",
  "duration": 90
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription activated successfully for the basic plan (90 days).",
  "data": {
    "plan": "basic",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-02-19T...",
    "subscriptionDuration": 90
  }
}
```

**Verify:**
- ✅ subscriptionDuration is 90
- ✅ subscriptionExpiresAt is 90 days from now
- ✅ Message mentions "90 days"

---

### 3. Test 1-Year Duration (365 days)

**Request:**
```bash
POST http://localhost:5001/api/subscriptions/activate
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "plan": "premium",
  "duration": 365
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription activated successfully for the premium plan (365 days).",
  "data": {
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-11-21T...",
    "subscriptionDuration": 365
  }
}
```

**Verify:**
- ✅ subscriptionDuration is 365
- ✅ subscriptionExpiresAt is 365 days from now
- ✅ Approximately 1 year in the future

---

### 4. Get Subscription Status

**Request:**
```bash
GET http://localhost:5001/api/subscriptions/status
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription status retrieved.",
  "data": {
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-11-21T...",
    "subscriptionDuration": 365
  }
}
```

**Verify:**
- ✅ subscriptionDuration field is present
- ✅ Matches the duration used in activation
- ✅ Status shows current subscription details

---

### 5. Test Invalid Duration (Should Fail)

**Request:**
```bash
POST http://localhost:5001/api/subscriptions/activate
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "plan": "premium",
  "duration": 9999
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "path": ["duration"],
        "message": "Number must be less than or equal to 3650"
      }
    ]
  }
}
```

**Verify:**
- ✅ Returns validation error
- ✅ Mentions duration limit (3650 days max)
- ✅ HTTP status 400

---

### 6. Test Upgrade with New Duration

**Setup:** User has active basic plan with 30 days

**Request:**
```bash
POST http://localhost:5001/api/subscriptions/activate
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "plan": "premium",
  "duration": 90
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription activated successfully for the premium plan (90 days).",
  "data": {
    "plan": "premium",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-02-19T...",
    "subscriptionDuration": 90
  }
}
```

**Verify:**
- ✅ Plan upgraded to premium
- ✅ Duration updated to 90 days
- ✅ Expiration date renewed from today
- ✅ New duration replaces old duration

---

### 7. Check User Profile Includes Duration

**Request:**
```bash
GET http://localhost:5001/api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "user": {
      "_id": "...",
      "name": "...",
      "email": "...",
      "plan": "premium",
      "subscriptionStatus": "active",
      "subscriptionExpiresAt": "2026-11-21T...",
      "subscriptionDuration": 365,
      ...
    }
  }
}
```

**Verify:**
- ✅ subscriptionDuration field present in user object
- ✅ Value matches active subscription
- ✅ null if no active subscription

---

## Postman Collection Setup

### Collection Variables
```
base_url: http://localhost:5001/api
access_token: (set after login)
```

### Pre-request Script (for authenticated requests)
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.collectionVariables.get('access_token')
});
```

### Test Script (for subscription activation)
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has subscriptionDuration", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('subscriptionDuration');
});

pm.test("subscriptionDuration matches request", function () {
    var jsonData = pm.response.json();
    var requestDuration = pm.request.body.raw ? 
        JSON.parse(pm.request.body.raw).duration || 30 : 30;
    pm.expect(jsonData.data.subscriptionDuration).to.eql(requestDuration);
});

pm.test("Expiration date is in future", function () {
    var jsonData = pm.response.json();
    var expiresAt = new Date(jsonData.data.subscriptionExpiresAt);
    var now = new Date();
    pm.expect(expiresAt.getTime()).to.be.above(now.getTime());
});
```

---

## Edge Cases to Test

### 1. Minimum Duration (1 day)
```json
{
  "plan": "premium",
  "duration": 1
}
```

### 2. Maximum Duration (3650 days / ~10 years)
```json
{
  "plan": "premium",
  "duration": 3650
}
```

### 3. Zero Duration (Should Fail)
```json
{
  "plan": "premium",
  "duration": 0
}
```

### 4. Negative Duration (Should Fail)
```json
{
  "plan": "premium",
  "duration": -30
}
```

### 5. String Duration (Should Fail)
```json
{
  "plan": "premium",
  "duration": "thirty"
}
```

### 6. Float Duration (Should Convert to Int)
```json
{
  "plan": "premium",
  "duration": 30.5
}
```

---

## Success Criteria

✅ All test scenarios pass
✅ Default duration works (30 days)
✅ Custom durations are stored correctly
✅ Duration is returned in all relevant endpoints
✅ Invalid durations are rejected with proper error messages
✅ Upgrades update duration correctly
✅ Expired subscriptions clear duration field
✅ User profile includes subscriptionDuration
✅ API documentation matches implementation
✅ No breaking changes to existing functionality

---

**Testing Date:** November 21, 2025
**Status:** Ready for Testing

