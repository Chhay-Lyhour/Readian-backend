<div align="center">

# 📚 Readian - Digital Book Reading & Publishing Platform

<img src="https://via.placeholder.com/200x80?text=Readian" alt="Readian Logo" />

<p><strong>A modern platform for authors and readers to publish, discover, and enjoy digital books</strong></p>

<p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue.svg" alt="License"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version"></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-6.0-green.svg" alt="MongoDB"></a>
</p>

<p>
  <a href="#-documentation">Documentation</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-getting-started">Installation</a> •
  <a href="API_DOCUMENTATION.md">API Docs</a> •
  <a href="#-contributing">Contributing</a>
</p>

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-documentation)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [Age Restriction System](#-age-restriction-system)
- [Subscription System](#-subscription-system)
- [Stripe Payment Integration](#-stripe-payment-integration)
- [File Upload & Storage](#-file-upload--storage)
- [PDF Generation](#-pdf-generation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

**Readian** is a comprehensive digital book platform that connects authors and readers. Authors can publish their books with multiple chapters, while readers can discover, read, rate, and download books. The platform features a sophisticated subscription system with Stripe payment integration, age-based content filtering, and premium features for enhanced user experience.

### Mission

To democratize publishing and reading by providing a seamless platform where authors can share their stories and readers can discover quality content.

### Vision

To become the leading digital book platform that empowers independent authors and provides readers with diverse, high-quality content.

---

## ✨ Key Features

### For Readers

- 📚 **Browse & Discover** - Explore thousands of books across various genres
- 🔍 **Advanced Search** - Search by title, author, genre, and tags (Premium)
- ⭐ **Rate & Review** - Share your thoughts on books you've read
- ❤️ **Like & Bookmark** - Save your favorite books for later
- 📥 **Download as PDF** - Download books for offline reading (Premium)
- 🔒 **Age-Appropriate Content** - Automatic filtering based on user age
- 📱 **Responsive Design** - Access from any device
- 👤 **Personalized Profile** - Customize your avatar and cover image
- 💳 **Flexible Subscriptions** - Pay securely with Stripe for Premium features

### For Authors

- ✍️ **Publish Books** - Create books with multiple chapters
- 📝 **Chapter Management** - Add, edit, delete, and reorder chapters
- 🎨 **Cover Images** - Upload custom book covers via Cloudinary
- 📊 **Analytics Dashboard** - Track views, likes, ratings, and downloads
- 💰 **Premium Content** - Mark books as premium for subscribers
- 🔞 **Content Rating** - Set age restrictions (Kids/Adult)
- 📈 **Author Stats** - Comprehensive statistics on your books
- 🚀 **Draft & Publish** - Work on drafts before publishing

### For Admins

- 👥 **User Management** - Manage all user accounts
- 📚 **Content Moderation** - Oversee published books
- 📊 **Platform Analytics** - View platform-wide statistics
- 🔧 **Role Management** - Assign and modify user roles
- 💰 **Subscription Management** - Manage user subscriptions

### Platform Features

- 🔐 **Secure Authentication** - JWT-based auth with access & refresh tokens
- 📧 **Email Verification** - Verify user emails with OTP codes
- 🔄 **Token Refresh** - Automatic token refresh for seamless experience
- 💳 **Stripe Payment Integration** - Secure subscription payments
- 🌍 **Cloudinary Integration** - Fast and reliable image storage
- 📄 **PDF Generation** - High-quality PDF exports with PDFKit
- 🛡️ **Rate Limiting** - Protection against abuse
- 🔒 **Security** - Helmet, CORS, and bcrypt for security
- 📱 **RESTful API** - Well-documented, easy-to-integrate API

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

### Payment

- **Payment Gateway:** Stripe API v17.4+
- **Webhooks:** Stripe webhook handling for subscription events

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

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** (local or MongoDB Atlas) - [Setup Guide](https://www.mongodb.com/docs/manual/installation/)
- **Cloudinary Account** - [Sign Up](https://cloudinary.com/)
- **Stripe Account** - [Sign Up](https://stripe.com/)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Chhay-Lyhour/Readian-backend.git
cd Readian-backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Install Stripe package:**

```bash
npm install stripe
```

4. **Create `.env` file:**

```bash
cp .env.example .env
```

5. **Configure environment variables:**

Edit `.env` with your configuration (see [Environment Variables](#-environment-variables))

6. **Start the server:**

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

7. **Verify installation:**

```bash
curl http://localhost:5001/api/analytics/public
```

If successful, you'll see platform analytics data.

---

## 📁 Project Structure

```
Readian-backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config/                   # Configuration files
│   │   ├── cloudinary.js         # Cloudinary setup
│   │   ├── config.js             # General config
│   │   ├── db.js                 # Database connection
│   │   └── stripe.js             # Stripe configuration
│   ├── controllers/              # Request handlers
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── subscriptionController.js
│   │   ├── paymentController.js
│   │   └── ...
│   ├── models/                   # Database models
│   │   ├── userModel.js
│   │   ├── bookModel.js
│   │   ├── subscriptionModel.js
│   │   └── ...
│   ├── routes/                   # API routes
│   │   ├── authRoute.js
│   │   ├── bookRoute.js
│   │   ├── subscriptionRoute.js
│   │   ├── paymentRoute.js
│   │   └── ...
│   ├── services/                 # Business logic
│   │   ├── authService.js
│   │   ├── subscriptionService.js
│   │   ├── paymentService.js
│   │   └── ...
│   ├── middlewares/              # Custom middlewares
│   │   ├── authMiddleware.js
│   │   ├── subscriptionMiddleware.js
│   │   └── ...
│   └── utils/                    # Utility functions
│       ├── errorHandler.js
│       └── responseHandler.js
├── uploads/                      # Local file storage
├── .env                          # Environment variables
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/readian
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/readian

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-too
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_BASIC_PRICE_ID=price_basic_monthly_id
STRIPE_PREMIUM_PRICE_ID=price_premium_monthly_id

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@readian.com

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# App URL (for webhooks)
APP_URL=http://localhost:5001
```

### Important Notes:

- **Never commit `.env` file to version control**
- Use strong, unique secrets for JWT tokens
- For production, use production Stripe keys (starting with `sk_live_`)
- Enable 2FA on your Stripe account for security

---

## 📊 Database Schema

### User Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  age: Number (0-150),
  role: String (enum: ['user', 'admin']),
  isVerified: Boolean,
  profileImage: String (Cloudinary URL),
  coverImage: String (Cloudinary URL),
  subscriptionTier: String (enum: ['free', 'basic', 'premium']),
  subscriptionStatus: String (enum: ['active', 'cancelled', 'past_due']),
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  subscriptionEndDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Schema

```javascript
{
  title: String (required),
  author: ObjectId (ref: 'User'),
  description: String,
  coverImage: String (Cloudinary URL),
  genre: String,
  tags: [String],
  isPremium: Boolean,
  contentType: String (enum: ['kids', 'adult']),
  status: String (enum: ['draft', 'published']),
  views: Number,
  likes: [ObjectId],
  ratings: [{
    user: ObjectId,
    rating: Number (1-5)
  }],
  averageRating: Number,
  chapters: [ObjectId] (ref: 'Chapter'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration**
   - User provides name, email, password, age
   - System creates account and sends verification email
   - User verifies email with OTP code

2. **Login**
   - User provides email and password
   - System validates credentials
   - Returns access token (15 min) and refresh token (7 days)

3. **Token Usage**
   - Access token included in `Authorization: Bearer <token>` header
   - When expired, use refresh token to get new access token

4. **Logout**
   - Client sends refresh token
   - Server invalidates token

### Authorization Levels

- **Public:** No authentication required (browse kids books)
- **User:** Requires valid access token (read, like, rate)
- **Subscriber:** Requires active subscription (premium books, downloads)
- **Admin:** Requires admin role (user management, analytics)

---

## 🔞 Age Restriction System

Readian implements a comprehensive age-based content filtering system:

### Content Types

1. **Kids Content (`contentType: "kids"`)**
   - Suitable for ages 0-17
   - Accessible to all users (logged in or not)

2. **Adult Content (`contentType: "adult"`)**
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
   - Enforced by `checkAgeRestriction` middleware

---

## 💳 Subscription System

### Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/month | - Browse kids books<br>- Read free books<br>- Basic profile |
| **Basic** | $4.99/month | - All Free features<br>- Read premium books<br>- Download up to 10 books/month<br>- Ad-free experience |
| **Premium** | $9.99/month | - All Basic features<br>- Unlimited downloads<br>- Advanced search<br>- Early access to new books<br>- Priority support |

### Features by Tier

```javascript
// Free Tier
- Browse and read kids books (no age restriction required)
- Browse free adult books (requires age 18+)
- Basic profile customization
- Like and rate books

// Basic Tier ($4.99/month)
- All Free tier features
- Access to premium books
- Download books as PDF (10/month limit)
- Ad-free experience
- Enhanced profile features

// Premium Tier ($9.99/month)
- All Basic tier features
- Unlimited PDF downloads
- Advanced search and filters
- Early access to new releases
- Priority customer support
- Special badge on profile
```

---

## 💰 Stripe Payment Integration

### Overview

Readian uses Stripe for secure subscription payments. Users can upgrade from Free to Basic or Premium tiers, and Stripe handles recurring billing automatically.

### Setup Instructions

#### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Enable test mode for development

#### 2. Create Products and Prices

**In Stripe Dashboard:**

1. Go to **Products** → **Add Product**

**Basic Subscription:**
- Product Name: `Readian Basic`
- Description: `Basic subscription with premium book access`
- Pricing: `$4.99 USD`
- Billing Period: `Monthly`
- Copy the **Price ID** (starts with `price_`)

**Premium Subscription:**
- Product Name: `Readian Premium`
- Description: `Premium subscription with unlimited downloads`
- Pricing: `$9.99 USD`
- Billing Period: `Monthly`
- Copy the **Price ID** (starts with `price_`)

3. Add these Price IDs to your `.env` file:

```env
STRIPE_BASIC_PRICE_ID=price_1234567890abcdef
STRIPE_PREMIUM_PRICE_ID=price_0987654321fedcba
```

#### 3. Setup Webhooks

Webhooks notify your server when subscription events occur (payment success, cancellation, etc.)

**In Stripe Dashboard:**

1. Go to **Developers** → **Webhooks** → **Add Endpoint**
2. Endpoint URL: `https://your-domain.com/api/payments/webhook`
   - For local testing: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com/)
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Signing Secret** (starts with `whsec_`)
5. Add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### 4. Local Testing with Stripe CLI

For local development, use Stripe CLI to forward webhook events:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5001/api/payments/webhook

# This will give you a webhook signing secret (whsec_...)
# Use this in your .env file for local testing
```

### Implementation

#### Step 1: Install Stripe

```bash
npm install stripe
```

#### Step 2: Create Stripe Configuration

The Stripe configuration file is already created at `src/config/stripe.js`.

#### Step 3: Payment Flow

**Frontend → Backend Flow:**

```
1. User clicks "Upgrade to Basic/Premium"
   ↓
2. Frontend calls: POST /api/payments/create-checkout-session
   Body: { tier: "basic" or "premium" }
   ↓
3. Backend creates Stripe Checkout Session
   ↓
4. Backend returns: { url: "https://checkout.stripe.com/..." }
   ↓
5. Frontend redirects user to Stripe Checkout
   ↓
6. User enters payment info on Stripe's secure page
   ↓
7. Stripe processes payment
   ↓
8. Stripe sends webhook to: /api/payments/webhook
   ↓
9. Backend updates user subscription in database
   ↓
10. Stripe redirects user back to success URL
```

### API Endpoints

#### Create Checkout Session

**Endpoint:** `POST /api/payments/create-checkout-session`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tier": "basic"  // or "premium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/c/pay/cs_test_...",
    "sessionId": "cs_test_..."
  }
}
```

**Frontend Usage:**
```javascript
// Create checkout session
const response = await fetch('/api/payments/create-checkout-session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ tier: 'basic' })
});

const data = await response.json();

// Redirect to Stripe Checkout
window.location.href = data.data.url;
```

#### Cancel Subscription

**Endpoint:** `POST /api/payments/cancel-subscription`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

#### Get Subscription Status

**Endpoint:** `GET /api/subscriptions/status`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tier": "basic",
    "status": "active",
    "endDate": "2025-12-20T10:30:00.000Z",
    "stripeSubscriptionId": "sub_...",
    "cancelAtPeriodEnd": false
  }
}
```

#### Webhook Handler

**Endpoint:** `POST /api/payments/webhook`

**This is called by Stripe, not your frontend**

Handles events:
- `checkout.session.completed` - Subscription created
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

### Success and Cancel URLs

After payment, Stripe redirects users to your frontend:

**Success URL:** `http://localhost:3000/subscription/success?session_id={CHECKOUT_SESSION_ID}`

**Cancel URL:** `http://localhost:3000/subscription/cancel`

Configure these in your frontend to show appropriate messages.

### Testing

#### Test Card Numbers

Stripe provides test cards for development:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |

**Use any future expiry date, any 3-digit CVC, and any postal code.**

#### Test Webhooks

```bash
# Listen for webhooks locally
stripe listen --forward-to localhost:5001/api/payments/webhook

# Trigger a test webhook
stripe trigger checkout.session.completed
```

### Security Best Practices

1. **Never expose secret keys** - Keep `STRIPE_SECRET_KEY` in `.env`
2. **Verify webhook signatures** - Always validate `stripe-signature` header
3. **Use HTTPS in production** - Stripe requires HTTPS for webhooks
4. **Handle idempotency** - Stripe may send duplicate webhooks
5. **Log all transactions** - Keep audit trail of subscription changes
6. **Test thoroughly** - Use test mode before going live

### Common Issues

**Issue:** Webhook not receiving events
- **Solution:** Check webhook URL is accessible from internet
- For local dev, use Stripe CLI or ngrok

**Issue:** "No such price" error
- **Solution:** Verify Price IDs in `.env` match Stripe Dashboard

**Issue:** Subscription not updating in database
- **Solution:** Check webhook signature verification and event handling

### Going Live

Before launching to production:

1. **Switch to live mode** in Stripe Dashboard
2. **Create live products and prices**
3. **Update `.env` with live keys:**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. **Update webhook endpoint** to production URL
5. **Test with real card** (small amount)
6. **Monitor Stripe Dashboard** for issues
7. **Set up email notifications** for failed payments

---

## 📄 File Upload & Storage

### Cloudinary Integration

Readian uses Cloudinary for storing images (book covers, profile images, cover images).

**Features:**
- Automatic image optimization
- CDN delivery for fast loading
- Secure storage
- Transformation capabilities

**Upload Endpoints:**
- `PUT /api/users/profile-image` - Upload profile image
- `PUT /api/users/cover-image` - Upload cover image
- `POST /api/books` - Upload book cover during creation
- `PUT /api/books/:id` - Update book cover

### PDF Generation

Books can be downloaded as PDFs with:
- Professional formatting
- Chapter organization
- Metadata (title, author, date)
- Optimized for reading

---

## 🚀 Deployment

### Prerequisites

- Node.js hosting (Heroku, Railway, DigitalOcean, etc.)
- MongoDB Atlas account
- Cloudinary account
- Stripe account
- Domain name (optional)

### Deployment Steps

#### 1. Prepare for Production

```bash
# Set NODE_ENV to production
NODE_ENV=production

# Update environment variables with production values
# - Production MongoDB URI
# - Production Stripe keys
# - Production frontend URL
# - Production webhook URL
```

#### 2. Deploy to Heroku (Example)

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create readian-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_mongodb_uri
heroku config:set STRIPE_SECRET_KEY=sk_live_your_key
# ... set all other env variables

# Deploy
git push heroku main

# Scale
heroku ps:scale web=1

# View logs
heroku logs --tail
```

#### 3. Configure Stripe Webhooks

Update webhook endpoint to production URL:
```
https://your-production-domain.com/api/payments/webhook
```

#### 4. Test Production

- Test registration and login
- Test subscription payment with real card (small amount)
- Test book uploads and downloads
- Monitor logs for errors

### Environment Variables for Production

Ensure all these are set:
- `NODE_ENV=production`
- `PORT` (usually provided by hosting platform)
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (strong secret)
- `JWT_REFRESH_SECRET` (strong secret)
- `STRIPE_SECRET_KEY` (live key: `sk_live_...`)
- `STRIPE_PUBLISHABLE_KEY` (live key: `pk_live_...`)
- `STRIPE_WEBHOOK_SECRET` (from production webhook)
- `STRIPE_BASIC_PRICE_ID` (live price ID)
- `STRIPE_PREMIUM_PRICE_ID` (live price ID)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_*` (production email credentials)
- `FRONTEND_URL` (production frontend URL)
- `APP_URL` (production backend URL)

---

## 🧪 Testing

### API Testing with Postman

See [POSTMAN_TESTING_GUIDE.md](POSTMAN_TESTING_GUIDE.md) for detailed testing procedures.

### Testing Stripe Integration

1. **Create Checkout Session:**
```bash
curl -X POST http://localhost:5001/api/payments/create-checkout-session \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "basic"}'
```

2. **Visit returned URL** and complete payment with test card: `4242 4242 4242 4242`

3. **Verify subscription** updated in database

4. **Test webhook** using Stripe CLI:
```bash
stripe trigger checkout.session.completed
```

### Manual Testing Checklist

- [ ] User registration and email verification
- [ ] Login and token refresh
- [ ] Profile image upload to Cloudinary
- [ ] Book creation with cover image
- [ ] Chapter creation and reading
- [ ] Age restriction for adult content
- [ ] Free tier limitations
- [ ] Stripe checkout for Basic tier
- [ ] Stripe checkout for Premium tier
- [ ] Premium book access after subscription
- [ ] PDF download with active subscription
- [ ] Subscription cancellation
- [ ] Webhook handling for all events
- [ ] Access revoked after subscription ends

---

## 📄 Documentation

### Complete Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference with all endpoints
- **[Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md)** - How to integrate with frontend
- **[Postman Testing Guide](POSTMAN_TESTING_GUIDE.md)** - Step-by-step testing procedures
- **[Privacy Policy](PRIVACY_POLICY.md)** - Privacy and data handling policies
- **[Terms and Conditions](TERMS_AND_CONDITIONS.md)** - Terms of service
- **[Documentation Index](DOCUMENTATION_INDEX.md)** - Master documentation index
- **[Changelog](CHANGELOG.md)** - Version history and updates

### Quick Links

- [Stripe Documentation](https://stripe.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

---

## 🤝 Contributing

We welcome contributions to Readian! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit:** `git commit -m 'Add amazing feature'`
6. **Push:** `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Coding Standards

- Use ES6+ features
- Follow existing code style
- Add comments for complex logic
- Write descriptive commit messages
- Update documentation for API changes

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- 🌍 Internationalization
- ♿ Accessibility improvements

---

## 📜 License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2025 Readian Team

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 💬 Support

Need help? We're here for you!

### Contact

- **Email:** support@readian.com
- **GitHub Issues:** [Create an issue](https://github.com/Chhay-Lyhour/Readian-backend/issues)
- **Twitter:** [@ReadianApp](https://twitter.com/ReadianApp)
- **Discord:** [Join our community](https://discord.gg/readian)

### FAQ

**Q: How do I test Stripe payments locally?**
A: Use Stripe CLI to forward webhooks and test card `4242 4242 4242 4242`.

**Q: Can I use a different payment provider?**
A: Yes, but you'll need to implement the payment service yourself. Stripe is recommended for its ease of use.

**Q: Is there a rate limit on the API?**
A: Yes, 100 requests per 15 minutes per IP address.

**Q: How do I reset my database?**
A: Drop the database in MongoDB and restart the server to recreate indexes.

**Q: Can I self-host Readian?**
A: Yes! Follow the deployment guide above.

### Reporting Bugs

When reporting bugs, please include:
1. Expected behavior
2. Actual behavior
3. Steps to reproduce
4. Environment details (Node version, OS, etc.)
5. Error logs (if applicable)

### Feature Requests

Have an idea? [Open a feature request](https://github.com/Chhay-Lyhour/Readian-backend/issues/new?template=feature_request.md)!

---

## 🗺️ Roadmap

### Version 2.0 (Q1 2026)

- [ ] Social features (follow authors, comments)
- [ ] Book recommendations with AI
- [ ] Mobile apps (iOS/Android)
- [ ] Audio book support
- [ ] Multiple language support
- [ ] Advanced analytics for authors
- [ ] Book series management
- [ ] Reading progress tracking
- [ ] Bookmarks and highlights

### Version 3.0 (Q3 2026)

- [ ] Author earnings and payouts
- [ ] Collaborative writing features
- [ ] Book marketplace
- [ ] Live reading events
- [ ] Reader achievements and badges
- [ ] Book clubs and communities

---

## 📊 Project Status

- **Version:** 1.0.0
- **Status:** Production Ready ✅
- **Last Updated:** November 20, 2025
- **Contributors:** 2
- **Open Issues:** 0
- **Closed Issues:** 15

---

## 🙏 Acknowledgments

Special thanks to:

- All contributors who helped build Readian
- The open-source community for amazing tools
- Our beta testers for valuable feedback
- Stripe for excellent payment infrastructure
- Cloudinary for reliable image hosting
- MongoDB for flexible data storage

---

## 📈 Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/Chhay-Lyhour/Readian-backend?style=social)
![GitHub forks](https://img.shields.io/github/forks/Chhay-Lyhour/Readian-backend?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/Chhay-Lyhour/Readian-backend?style=social)

</div>

---

<div align="center">

**Made with ❤️ by the Readian Team**

⭐ Star us on GitHub — it helps!

[🌐 Website](https://readian.com) • [📧 Email](mailto:support@readian.com) • [🐦 Twitter](https://twitter.com/ReadianApp) • [💬 Discord](https://discord.gg/readian)

</div>

