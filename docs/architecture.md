# System Architecture

This document describes the high-level architecture of the Task Manager application.

---

## Overview

Task Manager is a full-stack web application built with modern technologies:

- **Frontend**: React-based SPA (Single Page Application)
- **Backend**: Supabase (BaaS - Backend as a Service)
- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Supabase Auth (JWT-based)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENTS                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                              │
│  │   Browser   │  │   Mobile    │  │   Desktop   │                              │
│  │   (React)   │  │   (Future)  │  │   (Future)  │                              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                              │
└─────────│────────────────│────────────────│─────────────────────────────────────┘
          │                │                │
          │    HTTPS + JWT │                │
          └────────────────┼────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE PLATFORM                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           EDGE LAYER                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   Kong      │  │   GoTrue    │  │  PostgREST  │  │  Realtime   │    │   │
│  │  │  (Gateway)  │  │   (Auth)    │  │  (REST API) │  │  (WebSocket)│    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                         │
│                                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                      PostgreSQL                                  │    │   │
│  │  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │    │   │
│  │  │  │  auth.users   │  │ public.tasks  │  │ public.notes  │       │    │   │
│  │  │  │  (Supabase)   │  │  (RLS)        │  │  (RLS)        │       │    │   │
│  │  │  └───────────────┘  └───────────────┘  └───────────────┘       │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Frontend (apps/web)

| Component | Technology | Purpose |
|-----------|------------|---------|
| UI Framework | React 18+ | Component-based UI |
| Routing | React Router / Next.js | Page navigation |
| State Management | React Context / Zustand | Application state |
| Styling | CSS / Tailwind | Visual design |
| API Client | Supabase JS | Backend communication |

**Responsibilities:**
- Render user interface
- Handle user interactions
- Manage local state
- Make authenticated API calls
- Store JWT tokens

### Backend (Supabase)

| Service | Purpose |
|---------|---------|
| **GoTrue** | Authentication (signup, login, tokens) |
| **PostgREST** | Auto-generated REST API from schema |
| **Realtime** | WebSocket subscriptions for live updates |
| **Storage** | File uploads (future feature) |
| **Edge Functions** | Serverless functions (if needed) |

**Why Supabase?**
- No backend code needed for CRUD operations
- Built-in authentication
- Row Level Security for data isolation
- Real-time subscriptions
- Generous free tier

### Database (PostgreSQL)

| Schema | Tables | Purpose |
|--------|--------|---------|
| `auth` | `users` | User accounts (managed by Supabase) |
| `public` | `tasks` | User tasks |
| `public` | `notes` | User notes |

**Security:**
- RLS enabled on all public tables
- Foreign keys to `auth.users`
- Cascade delete for data cleanup

---

## Data Flow

### Read Operation (GET tasks)

```
┌──────────┐  1. GET /tasks    ┌──────────┐  2. Validate JWT  ┌──────────┐
│  Client  │ ─────────────────►│ PostgREST│ ─────────────────►│PostgreSQL│
│          │  + JWT Header     │          │  auth.uid()       │  + RLS   │
└──────────┘                   └──────────┘                   └──────────┘
     ▲                                                              │
     │                         4. JSON Response                     │
     └──────────────────────────────────────────────────────────────┘
                               (Only user's tasks)
```

### Write Operation (POST task)

```
┌──────────┐  1. POST /tasks   ┌──────────┐  2. Validate JWT  ┌──────────┐
│  Client  │ ─────────────────►│ PostgREST│ ─────────────────►│PostgreSQL│
│          │  + JWT + Body     │          │  Check RLS policy │  + RLS   │
└──────────┘                   └──────────┘                   └──────────┘
     ▲                                                              │
     │                         4. Created task                      │
     └──────────────────────────────────────────────────────────────┘
                               (If user_id matches auth.uid())
```

---

## Technology Stack

### Frontend Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Language | TypeScript | 5.x |
| Framework | React | 18.x |
| Build Tool | Vite / Next.js | Latest |
| HTTP Client | @supabase/supabase-js | 2.x |
| Styling | Tailwind CSS | 3.x |
| Icons | Lucide React | Latest |

### Backend Stack (Supabase)

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL 15 |
| Auth Server | GoTrue |
| API Server | PostgREST |
| Realtime | Elixir Phoenix |
| Edge Runtime | Deno |

---

## Security Architecture

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION                             │
│                                                                  │
│  1. User signs up/logs in                                        │
│     └─► Supabase Auth validates credentials                      │
│         └─► Returns JWT (access_token + refresh_token)           │
│                                                                  │
│  2. Client stores tokens                                         │
│     └─► localStorage or httpOnly cookies                         │
│                                                                  │
│  3. Client makes API requests                                    │
│     └─► Includes JWT in Authorization header                     │
│         └─► Supabase validates token                             │
│             └─► Extracts user_id via auth.uid()                  │
│                 └─► RLS filters data to user's rows only         │
└──────────────────────────────────────────────────────────────────┘
```

### Authorization (RLS)

```
┌─────────────────────────────────────────────────────────────────┐
│                       ROW LEVEL SECURITY                         │
│                                                                 │
│  ┌─────────────┐                      ┌─────────────────────┐  │
│  │   User A    │ ──── SELECT * ────►  │   tasks table       │  │
│  │   JWT: A    │                      │   ┌───────────────┐ │  │
│  └─────────────┘                      │   │ id │ user_id  │ │  │
│                                       │   ├────┼──────────┤ │  │
│        Result: Only rows              │   │ 1  │    A     │◄┤──┤ Returned
│        where user_id = A              │   │ 2  │    B     │ │  │
│                                       │   │ 3  │    A     │◄┤──┤ Returned
│                                       │   │ 4  │    C     │ │  │
│                                       │   └───────────────┘ │  │
│                                       └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Development

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                            │
│                                                                 │
│  ┌─────────────┐          ┌─────────────────────────────────┐  │
│  │  localhost  │          │        Supabase Cloud           │  │
│  │  :3000      │◄────────►│  (Development Project)          │  │
│  │  (Frontend) │   HTTPS  │  - Auth                         │  │
│  └─────────────┘          │  - Database                     │  │
│                           │  - API                          │  │
│                           └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Production

```
┌─────────────────────────────────────────────────────────────────┐
│                       PRODUCTION                                 │
│                                                                 │
│  ┌─────────────┐          ┌─────────────────────────────────┐  │
│  │   Vercel    │          │        Supabase Cloud           │  │
│  │   (CDN)     │◄────────►│  (Production Project)           │  │
│  │  Frontend   │   HTTPS  │  - Auth                         │  │
│  └─────────────┘          │  - Database                     │  │
│        │                  │  - API                          │  │
│        │                  │  - Backups                      │  │
│        ▼                  └─────────────────────────────────┘  │
│  ┌─────────────┐                                               │
│  │   Users     │                                               │
│  │  (Browser)  │                                               │
│  └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Architecture (MVP)

- Single Supabase project
- Serverless frontend (Vercel/Netlify)
- Suitable for: 0 - 10,000 users

### Future Scaling Options

| Challenge | Solution |
|-----------|----------|
| High read traffic | Add read replicas (Supabase Pro) |
| Complex backend logic | Add Edge Functions / separate API |
| Global users | Multi-region deployment |
| Large file storage | Supabase Storage + CDN |
| Real-time at scale | Supabase Realtime (built-in) |

---

## Related Documentation

- [Authentication Flow](./auth-flow.md)
- [Database Schema](./schema.md)
- [Environment Variables](./env-vars.md)
