# Readian Platform - Changelog

All notable changes to the Readian Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2025-11-23

### ✨ Features Added

#### Search and Filter with Book Status Access Control
- **Universal Search** - All users can search and filter books by:
  - Title (partial match, case-insensitive)
  - Tags (partial match, case-insensitive)
  - Author name (partial match, case-insensitive)
  - Genre (partial match, case-insensitive)
  
- **Book Status Access Tiers** - Automatic filtering based on subscription:
  - **Free & Basic Users**: Can only see and read **finished/completed** books
  - **Premium Users**: Can see **ongoing** and **finished** books (early access)
  - Backend automatically filters based on user's plan
  
- **Premium Content Access**:
  - Both Basic and Premium users can access premium books (isPremium)
  - Free users cannot access premium books
  
- **Smart Backend Filtering**:
  - No need for frontend to filter by bookStatus
  - Backend handles it transparently based on user plan
  - Works on both /api/books and /api/books/search endpoints

---

## [1.1.0] - 2025-11-23

### ✨ Features Added

#### Age-Based Content Filtering System
- **User Age Field** - Added age field to user model (0-150 years)
  - Optional field that users can set in their profile
  - Required for accessing adult content
  - Validation for reasonable age ranges
  
- **Content Type Classification** - Books can be classified as "kids" or "adult"
  - Kids content (0-17): Accessible to everyone (logged in or not)
  - Adult content (18+): Requires login and age ≥ 18
  - Default content type is "kids" for safety
  
- **Age Restriction Middleware** - Automatic enforcement across all book endpoints
  - Applied to book viewing, chapters, ratings, likes, and downloads
  - Returns appropriate error codes (AGE_NOT_SET, AGE_RESTRICTED)
  - Protects minors from inappropriate content

- **Content Type Management Endpoint** - `PATCH /api/books/:id/content-type`
  - Authors can update book content type post-publication
  - Only book author or admin can change content type
  - Immediate effect on access control

#### Enhanced Analytics
- **Public Analytics Endpoint** - `GET /api/analytics/public`
  - No authentication required - perfect for landing pages
  - Returns top 5 books and top 5 authors
  - Includes comprehensive engagement metrics
  
- **totalLikes Metric** - Added for both books and authors
  - Books: Number of users who liked the book
  - Authors: Combined likes across all author's books
  - Accurate like counts for better insights
  
- **Rich Metadata** - Enhanced analytics response
  - Book descriptions, images, genres
  - Author avatars and names
  - Engagement objects with views, likes, ratings, downloads
  - Download counts from DownloadModel

#### Subscription System Enhancements
- **Flexible Duration** - Custom subscription periods
  - Duration parameter: 1-3650 days (default 30)
  - Common values: 30 (monthly), 90 (quarterly), 365 (yearly)
  - Stored in user model as subscriptionDuration
  
- **Enhanced Response Data**
  - Returns subscriptionDuration in days
  - Returns subscriptionExpiresAt as ISO date
  - Clear expiration tracking for frontend

#### Download Improvements
- **Clean PDF Generation** - Improved PDF quality and layout
  - Removed watermarks for cleaner reading experience
  - Removed unnecessary footers and extra pages
  - Better page utilization without wasted space
  - Content-focused layout for better readability

#### Book Enhancements
- **Book Descriptions** - Added enticing book descriptions (10-1000 characters)
  - Displayed on book cards and detail pages
  - Optional field with validation
  - Supports rich, engaging text to hook readers

### 🔧 Improvements

#### API Enhancements
- Updated all book-related endpoints to respect age restrictions
- Improved error messages for age-restricted content
- Better error codes for frontend error handling

#### Documentation Updates
- **API_DOCUMENTATION.md** - Updated to v1.1.0
  - Added age restriction system section
  - Updated analytics endpoint response structure
  - Added subscription duration details
  - Added content type management endpoint
  
- **FRONTEND_INTEGRATION_GUIDE.md** - Complete overhaul to v1.1.0
  - Added "What's New in v1.1.0" section
  - Added migration guide from v1.0.0
  - Added comprehensive analytics integration patterns
  - Added age verification implementation examples
  - Added quick reference for key endpoints
  - Added error codes quick reference table
  - Updated subscription examples with duration
  - Added content type management examples

- **README.md** - Updated feature list
  - Added age restriction system features
  - Updated analytics capabilities
  - Added subscription duration control

- **DOCUMENTATION_INDEX.md** - Updated to v1.1.0
  - Added recent updates section
  - Updated all documentation references

### 🐛 Bug Fixes
- Fixed rating system to work properly with age restrictions
- Fixed download feature to respect author permissions
- Improved PDF generation reliability

### 🔒 Security
- Enhanced age verification for adult content
- Proper access control for sensitive content
- Age-based filtering at middleware level

### 📝 Developer Experience
- Added comprehensive code examples for age guards
- Added analytics integration patterns
- Added quick reference guides
- Improved error handling examples

---

## [1.0.0] - 2025-11-20

### 🎉 Initial Release

This is the first official release of the Readian Platform - a comprehensive digital book reading and publishing platform.

### ✨ Features Added

#### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Email verification with OTP codes
- Password reset functionality
- Role-based access control (Reader, Author, Admin)
- Token refresh mechanism
- Logout and logout all devices
- Secure password hashing with bcrypt

#### User Management
- User registration and profile management
- Profile image upload to Cloudinary
- Cover image upload to Cloudinary
- Age field for content restriction
- Bio and profile customization
- User role management
- Become author functionality
- Liked books tracking

#### Book Management
- Create books with multiple chapters
- Update and delete books
- Draft and publish workflow
- Book cover image upload
- Genre and tags categorization
- Premium content marking
- Age-based content types (kids/adult)
- Book status tracking (ongoing/finished)
- Reading time calculation
- View count tracking
- Allow/disallow downloads setting

#### Chapter Management
- Add chapters to books
- Update chapter content
- Delete chapters with automatic renumbering
- Reorder chapters
- Paginated chapter retrieval
- Table of contents generation

#### Rating System
- Rate books (1-5 stars)
- Average rating calculation
- Get user's own rating
- Delete ratings
- View all ratings with pagination
- User information in ratings

#### Like System
- Like and unlike books
- Like counter
- Liked by tracking
- Get user's liked books with pagination

#### Subscription System
- Three-tier plans (Free, Basic, Premium)
- Subscription activation with flexible duration (default: 30 days)
- Support for custom duration (1-3650 days)
- Automatic expiration handling
- Subscription status checking with duration tracking
- Premium feature gating
- Duration field stored in user model

#### Download System
- PDF generation with PDFKit
- Professional PDF formatting
- Book download with all chapters
- Download history tracking
- Download statistics
- Author download analytics
- Premium-only downloads
- Age restriction enforcement

#### Search & Discovery
- Search books by title and author
- Advanced filtering by genre and tags (Premium)
- Sort by likes (Premium)
- Pagination support
- Age-based content filtering
- Published books only in search

#### Analytics
- Public platform statistics
- Total books, authors, readers count
- Top books by views and likes
- Top authors statistics
- Author dashboard with comprehensive stats
- Download analytics

#### File Upload
- Cloudinary integration
- Profile image upload
- Cover image upload
- Book cover upload
- Image validation (type and size)
- Automatic URL generation

#### Age Restriction
- User age field (0-150)
- Content type classification (kids/adult)
- Automatic filtering based on age
- Age verification middleware
- Access denial for underage users
- Age requirement enforcement

#### Security & Performance
- Helmet for security headers
- CORS configuration
- Rate limiting (100 req/15min)
- Request validation with Zod
- Error handling middleware
- Custom error codes
- Standardized responses
- MongoDB connection pooling

#### Documentation
- Comprehensive API documentation
- Frontend integration guide
- Postman testing guide
- Privacy policy
- Terms and conditions
- README with full project overview
- Environment configuration template
- Documentation index

### 🛠 Technical Implementation

#### Backend
- Node.js v18+ with Express.js
- MongoDB with Mongoose ODM
- ES Modules (import/export)
- Async/await pattern throughout
- Repository pattern for data access
- Service layer for business logic
- Controller layer for request handling
- Middleware for cross-cutting concerns

#### Database Schema
- User model with comprehensive fields
- Book model with embedded ratings
- Chapter model with book reference
- Download tracking model
- Email verification model
- Refresh token model

#### API Design
- RESTful API principles
- Consistent response format
- Proper HTTP status codes
- Query parameter support
- Pagination on list endpoints
- Soft authentication (optional auth)

#### Dependencies
- express v4.21 - Web framework
- mongoose v8.19 - MongoDB ODM
- jsonwebtoken v9.0 - JWT handling
- bcryptjs v3.0 - Password hashing
- cloudinary v2.8 - Image storage
- multer v2.0 - File upload
- pdfkit v0.17 - PDF generation
- nodemailer v7.0 - Email service
- zod v4.1 - Validation
- winston v3.18 - Logging
- helmet v8.1 - Security
- cors v2.8 - CORS handling
- dotenv v17.2 - Environment variables
- express-rate-limit v8.1 - Rate limiting

### 📚 Documentation

- **README.md** - Project overview and setup (15+ pages)
- **API_DOCUMENTATION.md** - Complete API reference (50+ pages)
- **FRONTEND_INTEGRATION_GUIDE.md** - Integration guide (40+ pages)
- **POSTMAN_TESTING_GUIDE.md** - Testing procedures (30+ pages)
- **PRIVACY_POLICY.md** - Privacy compliance (15+ pages)
- **TERMS_AND_CONDITIONS.md** - Legal terms (10+ pages)
- **DOCUMENTATION_INDEX.md** - Documentation overview
- **.env.example** - Configuration template
- **CHANGELOG.md** - This file

### 🔐 Security Features

- Password encryption with bcrypt
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 days expiry)
- Token blacklisting on logout
- Email verification required
- Rate limiting to prevent abuse
- Helmet for HTTP security headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention (MongoDB)
- XSS protection

### 🎯 Key Highlights

1. **Age Restriction System**
   - Fully implemented content filtering
   - Automatic enforcement across all endpoints
   - Kids (0-17) and Adult (18+) content types
   - User age verification

2. **Subscription System**
   - Three-tier plans with feature gating
   - Automatic expiration handling
   - Premium features (advanced search, downloads)
   - Flexible duration-based activation

3. **Cloudinary Integration**
   - Seamless image uploads
   - Profile images and cover images
   - Book cover images
   - Secure URL generation

4. **PDF Download**
   - Professional formatting
   - Table of contents
   - All chapters included
   - Premium-only feature
   - Download tracking

5. **Comprehensive Documentation**
   - 160+ pages of documentation
   - Multiple guides for different audiences
   - Code examples in multiple frameworks
   - Testing scenarios
   - Legal compliance documents

### 📋 API Endpoints (60+)

#### Authentication (12 endpoints)
- POST /api/auth/register
- POST /api/auth/verify-email
- POST /api/auth/resend-verification
- POST /api/auth/login
- POST /api/auth/refresh-token
- GET /api/auth/me
- POST /api/auth/logout
- POST /api/auth/logout-all-devices
- POST /api/auth/forgot-password
- POST /api/auth/verify-password-reset-code
- POST /api/auth/reset-password
- POST /api/auth/change-password

#### Users (11 endpoints)
- PATCH /api/users/me
- PATCH /api/users/me/profile-image
- PATCH /api/users/me/cover-image
- POST /api/users/me/become-author
- GET /api/users/me/books
- GET /api/users/me/author-stats
- GET /api/users/me/liked-books
- GET /api/users
- GET /api/users/:id
- PATCH /api/users/:id
- DELETE /api/users/:id

#### Books (11 endpoints)
- GET /api/books
- GET /api/books/search
- GET /api/books/:id
- POST /api/books
- PATCH /api/books/:id
- DELETE /api/books/:id
- POST /api/books/:id/publish
- POST /api/books/:id/toggle-premium
- PATCH /api/books/:id/status
- POST /api/books/:id/like
- POST /api/books/:id/unlike

#### Chapters (6 endpoints)
- GET /api/books/:id/chapters
- GET /api/books/:id/chapters/:chapterNumber
- POST /api/books/:bookId/chapters
- PATCH /api/books/:bookId/chapters/:chapterNumber
- DELETE /api/books/:bookId/chapters/:chapterNumber
- POST /api/books/:bookId/chapters/reorder

#### Ratings (4 endpoints)
- POST /api/books/:bookId/rate
- GET /api/books/:bookId/rating/me
- DELETE /api/books/:bookId/rate
- GET /api/books/:bookId/ratings

#### Subscriptions (2 endpoints)
- POST /api/subscriptions/activate
- GET /api/subscriptions/status

#### Downloads (4 endpoints)
- GET /api/books/:bookId/download
- GET /api/downloads/history
- GET /api/downloads/stats
- GET /api/author/downloads/analytics

#### Analytics (1 endpoint)
- GET /api/analytics/public

### 🌍 Environment Support

- Development environment
- Production environment
- Environment variable configuration
- MongoDB local and Atlas support
- Cloudinary integration
- Email service configuration

### ✅ Testing

- Postman collection guidelines
- Test scenarios for all features
- Age restriction testing
- Subscription testing
- File upload testing
- Download testing
- Authentication flow testing

### 📦 Deployment Ready

- Production-ready code
- Environment configuration
- Security hardening
- Performance optimization
- Error handling
- Logging system
- Rate limiting
- CORS configuration

### 🐛 Known Issues

None reported in initial release.

### 🔜 Future Enhancements

Planned for future releases:
- Social features (follow authors, comments)
- Reading progress tracking
- AI-powered book recommendations
- Mobile apps (iOS/Android)
- Audio book support
- Multi-language support
- Author earnings dashboard
- Advanced analytics
- Book collections/series
- Collaborative writing features

---

## Version History

### [1.0.0] - 2025-11-20
- Initial release with full feature set
- Complete documentation suite
- Production-ready code
- Security hardening
- Performance optimization

---

## Upgrade Guide

### From 0.x to 1.0.0

This is the initial release. No upgrade path required.

---

## Breaking Changes

### Version 1.0.0

None. Initial release.

---

## Migration Guide

No migrations required for initial release.

---

## Contributors

- **Chhay Lyhour** - Project Lead & Main Developer
- **Community Contributors** - Thank you for your contributions!

---

## Support

For issues, questions, or contributions:
- **GitHub Issues:** https://github.com/Chhay-Lyhour/Readian-backend/issues
- **Email:** support@readian.com
- **Documentation:** See DOCUMENTATION_INDEX.md

---

## License

This project is licensed under the ISC License.

---

**Last Updated:** November 20, 2025  
**Changelog Version:** 1.0.0

---

© 2025 Readian Platform. All rights reserved.

