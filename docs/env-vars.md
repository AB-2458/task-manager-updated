# Environment Variables

This document describes all environment variables required for the Task Manager application.

---

## Overview

Environment variables are used for:
- **Configuration**: API URLs, ports, feature flags
- **Secrets**: API keys, database credentials
- **Environment-specific settings**: Development vs. production

---

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your values (see sections below)

3. **Never commit `.env.local` to version control**

---

## Supabase Configuration

### Required Variables

| Variable | Description | Example | Exposure |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` | ✅ Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous/public API key | `eyJhbGciOiJIUzI1NiIsInR...` | ✅ Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key (bypasses RLS) | `eyJhbGciOiJIUzI1NiIsInR...` | ❌ Server only |

### Where to Find These

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Application Configuration

### Frontend (apps/web)

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Settings (Optional)
NEXT_PUBLIC_APP_NAME=Task Manager
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (apps/api)

```env
# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Settings
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret-for-additional-signing
```

---

## Environment Files

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.example` | Template with placeholder values | ✅ Committed |
| `.env.local` | Local development values | ❌ Ignored |
| `.env.development` | Development environment | ❌ Ignored |
| `.env.production` | Production environment | ❌ Ignored |
| `.env.test` | Test environment | ❌ Ignored |

---

## Variable Naming Conventions

### Next.js (Frontend)

| Prefix | Visibility | Usage |
|--------|------------|-------|
| `NEXT_PUBLIC_` | Exposed to browser | API URLs, public keys |
| (no prefix) | Server-side only | Secrets, private keys |

```javascript
// ✅ Accessible in browser
process.env.NEXT_PUBLIC_SUPABASE_URL

// ❌ Only on server (undefined in browser)
process.env.SUPABASE_SERVICE_ROLE_KEY
```

### Vite (Alternative Frontend)

| Prefix | Visibility |
|--------|------------|
| `VITE_` | Exposed to browser |
| (no prefix) | Build-time only |

---

## Complete Variable Reference

### Frontend Variables

```env
# ====================================
# SUPABASE - Authentication & Database
# ====================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ====================================
# APPLICATION SETTINGS
# ====================================
NEXT_PUBLIC_APP_NAME=Task Manager
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ====================================
# FEATURE FLAGS (Optional)
# ====================================
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

### Backend Variables

```env
# ====================================
# SUPABASE - Admin Access
# ====================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ====================================
# SERVER CONFIGURATION
# ====================================
PORT=3001
NODE_ENV=development
HOST=0.0.0.0

# ====================================
# SECURITY
# ====================================
# Used for additional JWT operations if needed
JWT_SECRET=your-256-bit-secret-key-here
# CORS allowed origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ====================================
# LOGGING
# ====================================
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

---

## Security Guidelines

### ✅ DO

- Use `.env.local` for local development
- Add `.env*` to `.gitignore` (except `.env.example`)
- Use different keys for development and production
- Rotate keys periodically
- Use environment-specific Supabase projects

### ❌ DON'T

- Commit real API keys to version control
- Use `service_role` key in frontend code
- Share keys in plain text (Slack, email, etc.)
- Use production keys in development
- Log environment variables

---

## Loading Environment Variables

### Node.js (Backend)

```javascript
// Using dotenv
import 'dotenv/config';

// Or with explicit path
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Access variables
const supabaseUrl = process.env.SUPABASE_URL;
```

### Next.js (Frontend)

```javascript
// Automatic loading - just use them
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// In next.config.js for build-time
module.exports = {
  env: {
    CUSTOM_VAR: process.env.CUSTOM_VAR,
  },
};
```

---

## Validation

Validate required variables at startup:

```javascript
// utils/validateEnv.js
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

function validateEnv() {
  const missing = requiredVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

export default validateEnv;
```

---

## Production Deployment

### Vercel

```bash
# Set via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Or use Dashboard
# Vercel Dashboard → Project → Settings → Environment Variables
```

### Docker

```dockerfile
# Pass as build args
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
```

```bash
# Or at runtime
docker run -e SUPABASE_URL=... your-image
```

### Railway / Render / Fly.io

Use the respective platform's environment variable settings in the dashboard.

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Variable is `undefined` | Missing from `.env` file | Add to `.env.local` |
| Variable empty in browser | Missing `NEXT_PUBLIC_` prefix | Add prefix for client vars |
| Changes not taking effect | Server not restarted | Restart dev server |
| "Invalid API key" error | Wrong key or environment | Verify key matches project |
