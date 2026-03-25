# 🚀 LMS Project Deployment Guide

## Quick Deployment with Railway (Recommended - 5 minutes)

### Step 1: Sign Up for Railway
1. Go to [railway.app](https://railway.app)
2. Click "Sign up" → Continue with GitHub
3. Verify your email (required for free tier)

### Step 2: Deploy Your Project
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `LMS_PROJECT` repository
4. Railway will auto-detect your project settings

### Step 3: Configure Environment Variables
In Railway dashboard, go to Settings → Variables and add:

```
# Database (Railway provides these automatically)
DB_HOST=${RAILWAY_PRIVATE_MYSQLHOST}
DB_PORT=${RAILWAY_PRIVATE_MYSQLPORT}
DB_USER=${RAILWAY_PRIVATE_MYSQLUSER}
DB_PASSWORD=${RAILWAY_PRIVATE_MYSQLPASSWORD}
DB_NAME=${RAILWAY_PRIVATE_MYSQLDATABASE}

# JWT Secret (create your own)
JWT_SECRET=your-super-secret-jwt-key-here

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=https://your-app-name.railway.app
```

### Step 4: Deploy
1. Click "Deploy" button
2. Wait for deployment (2-3 minutes)
3. Your app will be live at: `https://your-app-name.railway.app`

---

## Alternative: Vercel + Railway Setup

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub → Select `LMS_PROJECT`
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Environment Variable**: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

### Backend (Railway)
1. Same as above but **Root Directory**: `backend`

---

## Post-Deployment Setup

### 1. Create Admin User
```sql
-- Run this in Railway MySQL database
INSERT INTO users (id, name, email, role, password, created_at) 
VALUES (
  UUID(), 
  'Admin User', 
  'admin@example.com', 
  'admin', 
  '$2b$10$your-hashed-password-here',
  NOW()
);
```

### 2. Access Your App
- **Frontend**: `https://your-app-name.railway.app`
- **API**: `https://your-app-name.railway.app/api`
- **Health Check**: `https://your-app-name.railway.app/api/health`

---

## Troubleshooting

### Common Issues:
1. **Build fails**: Check all environment variables are set
2. **Database connection**: Verify Railway MySQL is running
3. **CORS errors**: Ensure FRONTEND_URL is set correctly
4. **Login issues**: Check JWT_SECRET is set

### Reset Database:
```bash
# In Railway console
npm run migrate
npm run seed
```

---

## Free Tier Limits

### Railway:
- **$5/month credit** (usually enough for development)
- **500 hours/month** compute time
- **1GB database storage**

### Vercel:
- **Unlimited static sites**
- **100GB bandwidth/month**
- **No server-side time limits**

---

## Need Help?

1. **Check logs**: Railway dashboard → Logs
2. **Database**: Railway dashboard → MySQL
3. **Environment**: Railway dashboard → Settings → Variables

Your app should be live in 5-10 minutes! 🎉
