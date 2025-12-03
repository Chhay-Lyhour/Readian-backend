# 🚀 Render Deployment Guide for Readian Backend

This guide will walk you through deploying your Readian backend to Render.com.

## 📋 Prerequisites

Before deploying, make sure you have:

1. ✅ A GitHub account with your repository pushed
2. ✅ A Render account (sign up at https://render.com)
3. ✅ A MongoDB Atlas account with a database created
4. ✅ A SendGrid account with verified sender email
5. ✅ Your SendGrid API key (starts with `SG.`)

---

## 🔧 Step 1: Prepare Your Environment Variables

You'll need to set these environment variables in Render. Have them ready:

### Required Variables:

| Variable | Description | Example/Notes |
|----------|-------------|---------------|
| `MONGO_URI` | Production MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/readian?retryWrites=true&w=majority` |
| `TEST_MONGO_URI` | Test MongoDB connection string | Same format as MONGO_URI |
| `JWT_ACCESS_SECRET` | Secret for access tokens | Generate with: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Generate with: `openssl rand -base64 32` (different from access) |
| `SENDGRID_API_KEY` | Your SendGrid API key | Must start with `SG.` |
| `SENDGRID_FROM_EMAIL` | Your verified sender email | `noreply@yourdomain.com` |
| `CORS_ORIGIN` | Your frontend URL | `https://your-frontend.vercel.app` |
| `FRONTEND_URL` | Your frontend URL | Same as CORS_ORIGIN |

### Optional Variables (if using Cloudinary):

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

---

## 📦 Step 2: Push render.yaml to GitHub

1. The `render.yaml` file has been created in your project root
2. Commit and push it to your `main` branch:

```bash
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main
```

---

## 🌐 Step 3: Deploy to Render

### Option A: Deploy via Blueprint (Recommended)

1. Go to https://dashboard.render.com/
2. Click **"New +"** button (top right)
3. Select **"Blueprint"**
4. Click **"Connect account"** to connect your GitHub
5. Find and select your repository: `Chhay-Lyhour/Readian-backend`
6. Render will detect the `render.yaml` file
7. Click **"Apply"** to create the service

### Option B: Deploy Manually

1. Go to https://dashboard.render.com/
2. Click **"New +"** button
3. Select **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `readian-backend`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (upgrade to Starter for production)

---

## 🔐 Step 4: Set Environment Variables in Render

After the service is created:

1. Go to your service dashboard
2. Click **"Environment"** in the left sidebar
3. Click **"Add Environment Variable"**
4. Add each variable from the table above

### Quick Copy-Paste Format:

```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_connection_string
TEST_MONGO_URI=your_test_mongodb_connection_string
JWT_ACCESS_SECRET=your_generated_secret_1
JWT_REFRESH_SECRET=your_generated_secret_2
JWT_ACCESS_EXPIRY=3600
JWT_REFRESH_EXPIRY=1209600
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_email@example.com
BCRYPT_SALT_ROUNDS=12
EMAIL_VERIFICATION_EXPIRY=900
CORS_ORIGIN=https://your-frontend-url.com
FRONTEND_URL=https://your-frontend-url.com
```

5. Click **"Save Changes"**
6. Render will automatically redeploy with the new variables

---

## 🎯 Step 5: Verify Deployment

### Check Deployment Status

1. Watch the **"Logs"** tab during deployment
2. Wait for the message: `Server is running on port 10000`
3. Status should show **"Live"** (green)

### Test Your API

Your backend will be available at: `https://readian-backend.onrender.com`

Test the health endpoint:

```bash
curl https://readian-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "API is running",
  "timestamp": "2025-12-03T...",
  "environment": "production",
  "uptime": 123.45
}
```

### Test Database Connection

```bash
curl https://readian-backend.onrender.com/api/health/database
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-03T..."
}
```

---

## 🔍 Step 6: Update Your Frontend

Update your frontend to use the new backend URL:

```javascript
// Before
const API_URL = 'http://localhost:5001/api';

// After
const API_URL = 'https://readian-backend.onrender.com/api';
```

Or use environment variables:

```
VITE_API_URL=https://readian-backend.onrender.com/api
```

---

## ⚠️ Important Notes for Render Free Tier

### Cold Starts
- Free tier services **spin down after 15 minutes** of inactivity
- First request after spin down takes **30-60 seconds** to respond
- This is normal for free tier

### Solutions:
1. **Upgrade to Starter Plan** ($7/month) - no spin down
2. **Use a cron job** to ping your health endpoint every 10 minutes:
   - Use services like cron-job.org or UptimeRobot
   - Ping: `https://readian-backend.onrender.com/api/health`

### Rate Limits
- Free tier has bandwidth limits
- For production, consider upgrading to paid plan

---

## 🐛 Troubleshooting

### Issue: Service fails to start

**Check logs for:**
- Missing environment variables
- MongoDB connection errors
- SendGrid configuration errors

**Solution:** Ensure all required env vars are set correctly

### Issue: 401 Unauthorized from SendGrid

**Possible causes:**
1. Invalid API key
2. Sender email not verified

**Solution:**
1. Get new API key: https://app.sendgrid.com/settings/api_keys
2. Verify sender: https://app.sendgrid.com/settings/sender_auth

### Issue: Cannot connect to MongoDB

**Possible causes:**
1. IP whitelist restrictions in MongoDB Atlas
2. Invalid connection string

**Solution:**
1. In MongoDB Atlas → Network Access → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
2. Verify connection string format

### Issue: CORS errors

**Solution:**
Update `CORS_ORIGIN` and `FRONTEND_URL` to match your actual frontend URL

---

## 📊 Monitoring Your Service

### View Logs
1. Go to your service dashboard
2. Click **"Logs"** tab
3. View real-time logs

### View Metrics
1. Click **"Metrics"** tab
2. See CPU, memory, and bandwidth usage

### Set Up Alerts
1. Click **"Notifications"** in settings
2. Add email for deployment failures

---

## 🚀 Upgrading to Production

For production use, consider:

1. **Upgrade to Starter Plan** ($7/month)
   - No cold starts
   - Always-on service
   - Better performance

2. **Add Custom Domain**
   - Click "Settings" → "Custom Domain"
   - Add your domain (e.g., `api.readian.com`)

3. **Enable Auto-Deploy**
   - Already configured via render.yaml
   - Every push to `main` branch triggers deployment

4. **Set Up Environment Groups**
   - Group common variables
   - Reuse across services

---

## 📞 Support

If you encounter issues:

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **Your Service Logs**: Check the Logs tab in dashboard

---

## ✅ Deployment Checklist

- [ ] `render.yaml` pushed to GitHub
- [ ] Service created on Render
- [ ] All environment variables set
- [ ] MongoDB Atlas IP whitelist configured
- [ ] SendGrid sender verified
- [ ] Service deployed successfully (Status: Live)
- [ ] Health endpoint returns 200 OK
- [ ] Database health check passes
- [ ] Frontend updated with new API URL
- [ ] Test registration/login flow
- [ ] Test email sending

---

## 🎉 Success!

Your Readian backend is now deployed on Render! 

**Your API URL**: `https://readian-backend.onrender.com`

**Next Steps**:
1. Test all endpoints with Postman
2. Update frontend configuration
3. Test end-to-end user flows
4. Consider upgrading to paid plan for production

---

*Last updated: December 3, 2025*

