# Readian - Digital Book Reading & Publishing Platform
<div align="center">
![Readian Logo](https://via.placeholder.com/200x80?text=Readian)
**A modern platform for authors and readers to publish, discover, and enjoy digital books**
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
[Documentation](#documentation) • [Features](#features) • [Installation](#installation) • [API Docs](API_DOCUMENTATION.md) • [Contributing](#contributing)
</div>
---
## 📖 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Age Restriction System](#age-restriction-system)
- [Subscription System](#subscription-system)
- [File Upload & Storage](#file-upload--storage)
- [PDF Generation](#pdf-generation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
---
## 🌟 Overview
**Readian** is a comprehensive digital book platform that connects authors and readers. Authors can publish their books with multiple chapters, while readers can discover, read, rate, and download books. The platform features a sophisticated subscription system, age-based content filtering, and premium features for enhanced user experience.
### Mission
To democratize publishing and reading by providing a seamless platform where authors can share their stories and readers can discover quality content.
### Vision
To become the leading digital book platform that empowers independent authors and provides readers with diverse, high-quality content.
---
## ✨ Key Features
### For Readers
- 📚 **Browse & Discover:** Explore thousands of books across various genres
- 🔍 **Advanced Search:** Search by title, author, genre, and tags (Premium)
- ⭐ **Rate & Review:** Share your thoughts on books you've read
- ❤️ **Like & Bookmark:** Save your favorite books for later
- 📥 **Download as PDF:** Download books for offline reading (Premium)
- 🔒 **Age-Appropriate Content:** Automatic filtering based on user age
- 📱 **Responsive Design:** Access from any device
- 👤 **Personalized Profile:** Customize your avatar and cover image
### For Authors
- ✍️ **Publish Books:** Create books with multiple chapters
- 📝 **Chapter Management:** Add, edit, delete, and reorder chapters
- 🎨 **Cover Images:** Upload custom book covers via Cloudinary
- 📊 **Analytics Dashboard:** Track views, likes, ratings, and downloads
- 💰 **Premium Content:** Mark books as premium for subscribers
- 🔞 **Content Rating:** Set age restrictions (Kids/Adult)
- 📈 **Author Stats:** Comprehensive statistics on your books
- 🚀 **Draft & Publish:** Work on drafts before publishing
### For Admins
- 👥 **User Management:** Manage all user accounts
- 📚 **Content Moderation:** Oversee published books
- 📊 **Platform Analytics:** View platform-wide statistics
- 🔧 **Role Management:** Assign and modify user roles
### Platform Features
- 🔐 **Secure Authentication:** JWT-based auth with access & refresh tokens
- 📧 **Email Verification:** Verify user emails with OTP codes
- 🔄 **Token Refresh:** Automatic token refresh for seamless experience
- 💳 **Subscription System:** Free, Basic, and Premium tiers
- 🌍 **Cloudinary Integration:** Fast and reliable image storage
- 📄 **PDF Generation:** High-quality PDF exports with PDFKit
- 🛡️ **Rate Limiting:** Protection against abuse
- 🔒 **Security:** Helmet, CORS, and bcrypt for security
- 📱 **RESTful API:** Well-documented, easy-to-integrate API
---
## 🛠 Technology Stack
### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.21
- **Language:** JavaScript (ES Modules)
### Database
- **Database:** MongoDB v6.0+
- **ODM:** Mongoose v8.19
### Authentication & Security
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Security:** Helmet, CORS
- **Rate Limiting:** express-rate-limit
### File Handling
- **Image Upload:** Multer v2.0
- **Cloud Storage:** Cloudinary v2.8
- **PDF Generation:** PDFKit v0.17
### Validation & Error Handling
- **Validation:** Zod v4.1
- **Custom Error Handler:** AppError utility
### Email
- **Email Service:** Nodemailer v7.0
### Logging
- **Logger:** Winston v3.18
### Development Tools
- **Process Manager:** Nodemon
- **Environment Variables:** dotenv
---
## 🚀 Getting Started
### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary Account** (for image uploads)
### Installation
1. **Clone the repository:**
\`\`\`bash
git clone https://github.com/Chhay-Lyhour/Readian-backend.git
cd Readian-backend
\`\`\`
2. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`
3. **Create \`.env\` file:**
\`\`\`bash
cp .env.example .env
\`\`\`
4. **Configure environment variables:**
Edit \`.env\` with your configuration (see [Environment Variables](#environment-variables))
5. **Start the server:**
**Development mode (with auto-reload):**
\`\`\`bash
npm run dev
\`\`\`
**Production mode:**
\`\`\`bash
npm start
\`\`\`
6. **Verify installation:**
\`\`\`bash
curl http://localhost:5001/api/analytics/public
\`\`\`
If successful, you'll see platform analytics data.
---
## 🔐 Authentication & Authorization
### Authentication Flow
1. **Registration**
   - User provides name, email, password
   - System creates account and sends verification email
   - User verifies email with OTP code
2. **Login**
   - User provides email and password
   - System validates credentials
   - Returns access token (15 min) and refresh token (7 days)
3. **Token Usage**
   - Access token included in \`Authorization: Bearer <token>\` header
   - When expired, use refresh token to get new access token
4. **Logout**
   - Client sends refresh token
   - Server invalidates token
---
## 🔞 Age Restriction System
Readian implements a comprehensive age-based content filtering system:
### Content Types
1. **Kids Content (\`contentType: "kids"\`)**
   - Suitable for ages 0-17
   - Accessible to all users (logged in or not)
2. **Adult Content (\`contentType: "adult"\`)**
   - Restricted to ages 18+
   - Requires user login and age verification
### How It Works
1. **User Age Setup:**
   - Users set their age in profile settings
   - Age field: 0-150 years
   - Required for accessing adult content
2. **Content Filtering:**
   - Users under 18 see only kids content
   - Users 18+ see all content
   - Non-logged users see only kids content
3. **Enforcement:**
   - Applied to all book read endpoints
   - Applied to likes, ratings, and downloads
   - Enforced by \`checkAgeRestriction\` middleware
---
## 📄 Documentation
- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md) - How to integrate with frontend
- [Postman Testing Guide](POSTMAN_TESTING_GUIDE.md) - Testing procedures
- [Privacy Policy](PRIVACY_POLICY.md) - Privacy and data handling
- [Terms and Conditions](TERMS_AND_CONDITIONS.md) - Terms of service
- [Documentation Index](DOCUMENTATION_INDEX.md) - Master documentation index
- [Changelog](CHANGELOG.md) - Version history
---
## 📜 License
This project is licensed under the **ISC License**.
---
## 💬 Support
Need help? Here's how to get support:
- **Email:** support@readian.com
- **Issues:** [GitHub Issues](https://github.com/Chhay-Lyhour/Readian-backend/issues)
- **Documentation:** Check our comprehensive docs above
---
## 📊 Project Status
- **Version:** 1.0.0
- **Status:** Production Ready ✅
- **Last Updated:** November 20, 2025
---
<div align="center">
**Made with ❤️ by the Readian Team**
⭐ Star us on GitHub — it helps!
</div>
