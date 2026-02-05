# Deployment Guide

This guide covers deploying the Task Manager application to production.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │     │    Railway      │     │    Supabase     │
│   (Frontend)    │────►│   (Backend)     │────►│   (Database)    │
│   apps/web      │     │   apps/api      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Prerequisites

1. **Supabase Project** - Already set up with tables and RLS
2. **GitHub Repository** - Push your code to GitHub
3. **Accounts**:
   - [Vercel](https://vercel.com) (frontend)
   - [Railway](https://railway.app) (backend) 

---

## Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Task Manager full-stack app"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/task-manager-updated.git

# Push
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will detect it's a monorepo

### 2.2 Configure Backend Service

1. Click **"Add Service"** → **"GitHub Repo"**
2. Select the same repo
3. In service settings:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.3 Add Environment Variables

In Railway dashboard → Variables, add:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` |
| `PORT` | `3001` (Railway provides this automatically) |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` |

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Copy the generated URL (e.g., `https://task-manager-api-production.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository

### 3.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `apps/web` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3.3 Add Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |
| `VITE_API_BASE_URL` | `https://your-backend.up.railway.app` |

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app is live at `https://your-app.vercel.app`

---

## Step 4: Update CORS (Important!)

After deploying frontend, update the backend's `CORS_ORIGINS`:

1. Go to Railway dashboard
2. Select your backend service
3. Go to **Variables**
4. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   https://task-manager.vercel.app
   ```
5. Redeploy

---

## Step 5: Update Supabase Auth URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Environment Variables Summary

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `VITE_API_BASE_URL` | Backend API URL | `https://api.railway.app` |

### Backend (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `production` |
| `CORS_ORIGINS` | Allowed origins | `https://app.vercel.app` |

---

## Alternative: Deploy Backend to Render

### Create Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Deploy

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGINS` in backend matches your frontend URL exactly
- No trailing slash in URLs
- Redeploy backend after changing env vars

### 401 Unauthorized
- Check `VITE_SUPABASE_ANON_KEY` is correct in frontend
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct in backend
- Verify Supabase URL is accessible

### Build Failures
- Check root directory is set correctly (`apps/web` or `apps/api`)
- Ensure `package.json` has correct scripts
- Check build logs for specific errors

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Railway
1. Go to Service Settings → Networking
2. Add custom domain
3. Update DNS records

---

## Production Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured for production URLs
- [ ] Supabase Auth URLs updated
- [ ] Test login/register flow
- [ ] Test create/read/update/delete tasks
- [ ] Test create/read/update/delete notes
