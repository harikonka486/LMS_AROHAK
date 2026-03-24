# LMS ERP — Deployment Guide

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | https://lms-erp.vercel.app |
| Backend  | https://lms-erp-1.onrender.com |
| Database | Clever Cloud MySQL |

---


| Layer    | Service         | Free Tier |
|----------|----------------|-----------|
| Frontend | Vercel          | ✅ Free   |
| Backend  | Render          | ✅ Free   |
| Database | Clever Cloud MySQL | ✅ Free |
| Storage  | Cloudinary      | ✅ Free   |

---

## Step 1 — Database (Clever Cloud)

1. Go to [clever-cloud.com](https://clever-cloud.com) → Create account
2. Create a new **MySQL** add-on (free tier)
3. Copy the connection details from the add-on dashboard:
   - Host, Port, User, Password, Database name
4. These go into Render env vars (Step 2)

---

## Step 2 — Backend (Render)

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo: `harigopalkonka/lms-erp`
3. Set these settings:
   - **Root Directory:** `lms-erp/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Node Version:** 20

4. Add these **Environment Variables** in Render dashboard:

```
NODE_ENV=production
PORT=4000
CLIENT_URL=https://your-vercel-app.vercel.app

DB_HOST=<MYSQL_ADDON_HOST from Clever Cloud>
DB_PORT=3306
DB_USER=<MYSQL_ADDON_USER from Clever Cloud>
DB_PASSWORD=<MYSQL_ADDON_PASSWORD from Clever Cloud>
DB_NAME=<MYSQL_ADDON_DB from Clever Cloud>

JWT_SECRET=<generate-a-long-random-string>
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

> Note: Clever Cloud shows vars as `MYSQL_ADDON_HOST`, `MYSQL_ADDON_USER` etc.
> Enter them in Render as `DB_HOST`, `DB_USER` etc. (the app expects `DB_*` keys)

5. Deploy — note your backend URL e.g. `https://lms-erp-api.onrender.com`

6. After first deploy, run migrations + seed via Render **Shell**:
```bash
node src/db/migrate.js
node src/db/seed.js
```

---

## Step 3 — Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo: `harigopalkonka/lms-erp`
3. Set **Root Directory** to `lms-erp/frontend`
4. Add this **Environment Variable**:

```
NEXT_PUBLIC_API_URL=https://lms-erp-1.onrender.com/api
```

5. Deploy — frontend is live at `https://lms-erp.vercel.app`

6. Go back to **Render** and update `CLIENT_URL` to `https://lms-erp.vercel.app`

---

## Step 4 — Cloudinary (File Uploads)

1. Go to [cloudinary.com](https://cloudinary.com) → Create free account
2. From the dashboard copy: Cloud Name, API Key, API Secret
3. Add these to Render env vars (already listed in Step 2)

---

## Default Login Credentials (after seed)

| Role     | Email                  | Password          |
|----------|------------------------|-------------------|
| Admin    | admin@arohak.com       | Ar0hak#Admin2024  |
| Employee | employee@arohak.com    | Ar0hak#Emp2024    |

---

## Re-deploying Updates

Just push to `main` branch — both Render and Vercel auto-deploy on push.

```bash
git add -A
git commit -m "your message"
git push origin main
```
