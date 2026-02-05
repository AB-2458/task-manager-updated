# Authentication Flow

This document describes the authentication architecture for the Task Manager application.

---

## Overview

The Task Manager uses **Supabase Auth** for identity management:

- **Provider**: Email/Password authentication
- **Token Type**: JWT (JSON Web Tokens)
- **Session Storage**: Client-side (localStorage/cookies)
- **Security**: Row Level Security (RLS) at database level

---

## How Supabase Auth Works

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE PLATFORM                               │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   GoTrue    │    │  PostgREST  │    │  PostgreSQL │    │  auth.users │  │
│  │  (Auth API) │◄──►│  (REST API) │◄──►│  (Database) │◄──►│   (Table)   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         ▲                  ▲                                                │
└─────────│──────────────────│────────────────────────────────────────────────┘
          │                  │
          │ Auth Requests    │ Data Requests + JWT
          │                  │
    ┌─────┴──────────────────┴─────┐
    │         CLIENT APP           │
    │  (Browser / Mobile / Server) │
    └──────────────────────────────┘
```

### Components

| Component | Purpose |
|-----------|---------|
| **GoTrue** | Open-source auth server handling signup, login, tokens |
| **PostgREST** | REST API for database access with JWT validation |
| **PostgreSQL** | Database with RLS for security |
| **auth.users** | Built-in table storing user credentials |

---

## JWT (JSON Web Token) Explained

### What is a JWT?

A JWT is a secure, self-contained token that carries user identity information.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└──────────────────┘ └─────────────────────────────────────────────────────────────────────────────┘ └──────────────────────────────┘
      HEADER                                    PAYLOAD                                                    SIGNATURE
```

### JWT Structure

**Header** (Algorithm & Token Type):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Claims - User Data):
```json
{
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1704067200,
  "exp": 1704153600
}
```

| Claim | Description |
|-------|-------------|
| `sub` | Subject - User's UUID (used by `auth.uid()`) |
| `email` | User's email address |
| `role` | User role (`authenticated`, `anon`, `service_role`) |
| `iat` | Issued At timestamp |
| `exp` | Expiration timestamp |

**Signature**: Created using the JWT secret to prevent tampering.

### How JWT Secures Requests

```
┌──────────────┐                           ┌──────────────┐
│    Client    │  1. Request + JWT Header  │   Supabase   │
│              │ ─────────────────────────►│   Server     │
└──────────────┘                           └──────────────┘
                                                  │
                                                  │ 2. Validate JWT
                                                  │    - Check signature
                                                  │    - Check expiration
                                                  │    - Extract user_id
                                                  ▼
                                           ┌──────────────┐
                                           │   Database   │
                                           │   + RLS      │
                                           └──────────────┘
                                                  │
                                                  │ 3. auth.uid() = user_id
                                                  │    Filter rows by policy
                                                  ▼
                                           ┌──────────────┐
                                           │   Return     │
                                           │  User's Data │
                                           └──────────────┘
```

---

## How `auth.uid()` Works

### Definition

`auth.uid()` is a PostgreSQL function that extracts the user's UUID from the current request's JWT.

```sql
-- Returns the 'sub' claim from the JWT
auth.uid() → uuid
```

### Usage in RLS Policies

```sql
-- Policy: Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);
```

### Execution Flow

```
1. User makes API request with JWT
   └─► JWT Header: Authorization: Bearer eyJhbGci...

2. Supabase validates JWT signature
   └─► If invalid → 401 Unauthorized

3. Supabase extracts 'sub' claim
   └─► sub: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

4. PostgreSQL executes query with RLS
   └─► auth.uid() returns "a1b2c3d4-..."

5. RLS policy filters results
   └─► WHERE user_id = auth.uid()

6. Only user's own data is returned
```

### Security Guarantee

| Scenario | Result |
|----------|--------|
| Valid JWT for User A | `auth.uid()` = User A's ID |
| Valid JWT for User B | `auth.uid()` = User B's ID |
| Invalid/Expired JWT | Request rejected (401) |
| No JWT (anonymous) | `auth.uid()` = NULL → No access |

---

## Authentication Flows

### Registration (Sign Up)

```
┌──────────────┐                           ┌──────────────┐
│    Client    │  1. POST /auth/v1/signup  │   Supabase   │
│              │ ─────────────────────────►│   Auth       │
│              │    {email, password}      │              │
└──────────────┘                           └──────────────┘
       │                                          │
       │                                          │ 2. Create user in auth.users
       │                                          │    Hash password
       │                                          │    Generate JWT
       │                                          ▼
       │                                   ┌──────────────┐
       │  3. Return session                │   Database   │
       │◄──────────────────────────────────│              │
       │    {access_token, refresh_token}  └──────────────┘
       │
       │ 4. Store tokens
       ▼
┌──────────────┐
│  localStorage│
│  or cookies  │
└──────────────┘
```

**Code Example (Supabase JS):**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
});

// data.session contains access_token and refresh_token
```

---

### Login (Sign In)

```
┌──────────────┐                           ┌──────────────┐
│    Client    │  1. POST /auth/v1/token   │   Supabase   │
│              │ ─────────────────────────►│   Auth       │
│              │    {email, password}      │              │
└──────────────┘                           └──────────────┘
       │                                          │
       │                                          │ 2. Verify credentials
       │                                          │    Generate new JWT
       │                                          ▼
       │  3. Return session                ┌──────────────┐
       │◄──────────────────────────────────│   Database   │
       │    {access_token, refresh_token}  └──────────────┘
       │
       │ 4. Store tokens
       ▼
┌──────────────┐
│  localStorage│
│  or cookies  │
└──────────────┘
```

**Code Example:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
});
```

---

### Token Refresh

Access tokens expire after a set period (default: 1 hour). The refresh token is used to obtain new access tokens.

```
┌──────────────┐                           ┌──────────────┐
│    Client    │  1. Access token expired  │   Supabase   │
│              │                           │   Auth       │
│              │  2. POST /auth/v1/token   │              │
│              │ ─────────────────────────►│              │
│              │    ?grant_type=refresh_token             │
│              │    {refresh_token}        │              │
└──────────────┘                           └──────────────┘
       │                                          │
       │  3. Return new tokens             │
       │◄──────────────────────────────────┘
       │    {access_token, refresh_token}
       │
       │ 4. Replace stored tokens
       ▼
```

**Note**: Supabase JS client handles token refresh automatically.

---

### Logout (Sign Out)

```
┌──────────────┐                           ┌──────────────┐
│    Client    │  1. POST /auth/v1/logout  │   Supabase   │
│              │ ─────────────────────────►│   Auth       │
│              │                           │              │
└──────────────┘                           └──────────────┘
       │                                          │
       │                                          │ 2. Invalidate refresh token
       │  3. Success                              │
       │◄─────────────────────────────────────────┘
       │
       │ 4. Clear stored tokens
       ▼
```

**Code Example:**
```javascript
const { error } = await supabase.auth.signOut();
```

---

## Making Authenticated Requests

### Automatic (Supabase JS Client)

```javascript
// Client automatically includes JWT in requests
const { data, error } = await supabase
  .from('tasks')
  .select('*');

// Only returns current user's tasks (RLS enforced)
```

### Manual (REST API)

```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/tasks' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

---

## Security Best Practices

### Client-Side

| Practice | Description |
|----------|-------------|
| ✅ Use HTTPS | All requests must be over HTTPS |
| ✅ Secure storage | Use `httpOnly` cookies when possible |
| ✅ Short token expiry | Access tokens expire in 1 hour |
| ✅ Refresh tokens | Use refresh tokens for long sessions |
| ❌ Never expose secrets | Never put service_role key in client code |

### Server-Side

| Practice | Description |
|----------|-------------|
| ✅ Enable RLS | Always enable Row Level Security |
| ✅ Validate tokens | Let Supabase validate JWTs |
| ✅ Use service_role only server-side | For admin operations only |
| ❌ Never disable RLS | Even for "trusted" tables |

---

## Environment Variables

Required for authentication:

| Variable | Purpose | Exposure |
|----------|---------|----------|
| `SUPABASE_URL` | Supabase project URL | Public (client) |
| `SUPABASE_ANON_KEY` | Anonymous/public API key | Public (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key | **Server only** |

See [env-vars.md](./env-vars.md) for complete configuration.

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/expired token | Check token, refresh if needed |
| Empty results from query | RLS filtering all rows | Verify `auth.uid()` matches `user_id` |
| CORS errors | Missing configuration | Check Supabase dashboard settings |
| "JWT expired" | Token timeout | Implement token refresh logic |

### Debug Tips

1. **Check JWT contents**: Use [jwt.io](https://jwt.io) to decode tokens
2. **Verify RLS policies**: Test in Supabase SQL Editor
3. **Check auth state**: Log `supabase.auth.getSession()` result
