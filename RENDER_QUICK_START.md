# 🚀 Quick Render Deployment Steps

## 1️⃣ Push to GitHub
```bash
git add render.yaml RENDER_DEPLOYMENT_GUIDE.md .env.render
git commit -m "Add Render deployment configuration"
git push origin main
```

## 2️⃣ Create Service on Render
1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Blueprint"**
3. Connect GitHub: `Chhay-Lyhour/Readian-backend`
4. Click **"Apply"**

## 3️⃣ Set Environment Variables
Go to **Environment** tab and add:

```bash
# Generate JWT secrets first:
openssl rand -base64 32  # Use output for JWT_ACCESS_SECRET
openssl rand -base64 32  # Use output for JWT_REFRESH_SECRET (different!)
```

### Required Variables:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/readian
TEST_MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/readian_test
JWT_ACCESS_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=your-verified-email@domain.com
CORS_ORIGIN=https://your-frontend-url.com
FRONTEND_URL=https://your-frontend-url.com
```

## 4️⃣ Verify Deployment
```bash
# Test health endpoint
curl https://readian-backend.onrender.com/api/health

# Test database
curl https://readian-backend.onrender.com/api/health/database
```

## 5️⃣ Update Frontend
Change your frontend API URL to:
```
https://readian-backend.onrender.com/api
```

## ⚠️ Important Reminders

### SendGrid Setup:
1. **Get API Key**: https://app.sendgrid.com/settings/api_keys
   - Click "Create API Key"
   - Choose "Restricted Access"
   - Enable "Mail Send" → Full Access
   - Copy the key (starts with `SG.`)

2. **Verify Sender**: https://app.sendgrid.com/settings/sender_auth
   - Click "Verify a Single Sender"
   - Add your email
   - Check email and verify

### MongoDB Atlas:
1. Go to **Network Access**
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Free Tier Note:
- Service spins down after 15 min of inactivity
- First request after spin down takes 30-60 seconds
- Upgrade to Starter ($7/month) for always-on service

## 📝 Checklist
- [ ] Pushed render.yaml to GitHub
- [ ] Created service on Render
- [ ] Generated JWT secrets
- [ ] Set all environment variables
- [ ] Configured MongoDB IP whitelist
- [ ] Verified SendGrid sender
- [ ] Service status shows "Live" (green)
- [ ] Health check returns 200 OK
- [ ] Updated frontend API URL
- [ ] Tested registration + email sending

## 🎉 Done!
Your backend is live at: `https://readian-backend.onrender.com`

For detailed instructions, see: `RENDER_DEPLOYMENT_GUIDE.md`

