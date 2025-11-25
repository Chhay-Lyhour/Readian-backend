# Vercel Deployment Guide for Readian Backend

## Overview
This guide explains how to deploy the Readian backend API to Vercel's serverless platform.

## Prerequisites
- Vercel account (free tier is sufficient)
- GitHub/GitLab/Bitbucket repository (recommended) or Vercel CLI
- MongoDB Atlas database (required for production)
- Cloudinary account for media storage

## Configuration Files

### 1. vercel.json
The `vercel.json` file configures how Vercel builds and routes your application:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. .vercelignore
Excludes unnecessary files from deployment to reduce bundle size.

## Environment Variables Required

Set these in your Vercel project settings (Dashboard → Project → Settings → Environment Variables):

### Database
- `MONGO_URI` - Your MongoDB Atlas connection string
- `DB_NAME` - Database name (e.g., "readian")

### JWT & Authentication
- `JWT_SECRET` - Secret key for access tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `JWT_EMAIL_SECRET` - Secret key for email verification
- `ACCESS_TOKEN_EXPIRY` - Token expiry (e.g., "1h")
- `REFRESH_TOKEN_EXPIRY` - Refresh token expiry (e.g., "7d")

### Email (NodeMailer)
- `EMAIL_USER` - Your email service username
- `EMAIL_PASS` - Your email service password/app password
- `EMAIL_FROM` - From email address

### Cloudinary
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Application
- `PORT` - Port number (default: 5001)
- `CORS_ORIGIN` - Frontend URL (e.g., "https://yourdomain.com")
- `NODE_ENV` - Set to "production"

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables listed above
   - Apply to Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your API will be available at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "/Users/sopheappit/Desktop/Readian Training Project/Readian-backend"
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No (first time)
   - Project name: readian-backend
   - Directory: ./
   - Override settings: No

5. **Set Environment Variables**
   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_SECRET
   # ... add all other variables
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Important Notes

### Serverless Architecture
Vercel uses serverless functions, which means:
- Each request spins up a new function instance
- No persistent server state
- Database connections are created per request
- File uploads should use Cloudinary (not local filesystem)

### File Uploads
The `uploads/` directory won't work on Vercel's serverless platform. Ensure:
- All file uploads go to Cloudinary
- Remove any local file storage references
- Use Cloudinary URLs for serving media

### Database Connections
- Use MongoDB Atlas with connection pooling
- Each serverless function creates its own connection
- Mongoose handles connection reuse automatically

### CORS Configuration
Update your frontend URL in environment variables:
```
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

Or allow multiple origins in your code if needed.

## Testing Deployment

1. **Check Health Endpoint**
   ```bash
   curl https://your-project.vercel.app/api/health
   ```

2. **Test API Endpoints**
   ```bash
   curl https://your-project.vercel.app/api/books
   ```

3. **Check Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on any function to see logs

## Troubleshooting

### Issue: "builds" configuration warning
**Solution**: This is normal. When using `builds` in vercel.json, Vercel uses that configuration instead of dashboard settings. This is the intended behavior.

### Issue: Database connection errors
**Solution**: 
- Verify `MONGO_URI` is correct in environment variables
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check Network Access settings in MongoDB Atlas

### Issue: File upload errors
**Solution**: 
- Verify Cloudinary credentials are set correctly
- Ensure all uploads use Cloudinary (not local filesystem)
- Check upload middleware is using Cloudinary storage

### Issue: CORS errors
**Solution**:
- Set `CORS_ORIGIN` environment variable to your frontend URL
- Ensure frontend is making requests to the correct Vercel URL
- Check CORS configuration in `src/app.js`

### Issue: Function timeout
**Solution**:
- Vercel free tier has 10-second timeout
- Optimize database queries
- Consider upgrading to Pro plan for 60-second timeout

## Local Development

Local development remains unchanged:

```bash
npm run dev
```

The app detects it's not on Vercel and runs normally on `localhost:5001`.

## Monitoring and Logs

### View Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on any deployment
5. View "Functions" tab for logs

### Analytics
- Vercel provides built-in analytics
- View in Dashboard → Your Project → Analytics

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers production deployment
- Every push to other branches creates preview deployments
- Preview URLs are automatically generated

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CORS_ORIGIN` environment variable

## Performance Optimization

### Cold Starts
- First request after inactivity may be slower
- Vercel caches functions after first use
- Consider Pro plan for improved cold start performance

### Database Connection Pooling
Already configured in `src/config/db.js` with:
```javascript
maxPoolSize: 10,
minPoolSize: 2
```

## Security Checklist

- ✅ All sensitive data in environment variables
- ✅ No `.env` file in repository
- ✅ CORS properly configured
- ✅ Helmet security headers enabled
- ✅ Rate limiting implemented
- ✅ JWT tokens for authentication
- ✅ MongoDB Atlas IP whitelist configured

## Support

For issues:
1. Check Vercel deployment logs
2. Review MongoDB Atlas metrics
3. Test endpoints with Postman
4. Check browser console for CORS errors

## Next Steps

After deployment:
1. Test all API endpoints
2. Update frontend API base URL
3. Configure custom domain (optional)
4. Set up monitoring and alerts
5. Test authentication flows
6. Verify file uploads to Cloudinary
7. Test subscription features
8. Verify age restriction middleware

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] MongoDB Atlas allows Vercel connections
- [ ] Cloudinary configured correctly
- [ ] CORS origin set to frontend URL
- [ ] Health endpoint responding
- [ ] Authentication working
- [ ] File uploads going to Cloudinary
- [ ] Database queries optimized
- [ ] Frontend updated with API URL
- [ ] All routes tested in Postman

---

**Your API will be available at**: `https://your-project-name.vercel.app`

**API Base URL for Frontend**: `https://your-project-name.vercel.app/api`

