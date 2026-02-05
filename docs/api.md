# API Documentation

This document provides technical documentation for the Task Manager Backend API.

---

## Overview

The Task Manager API is a RESTful service built with Express.js that provides endpoints for managing tasks and notes. Authentication is handled via Supabase Auth JWTs.

---

## Request Lifecycle

```
┌──────────────┐     1. HTTP Request      ┌──────────────┐
│    Client    │ ─────────────────────────►│    Express   │
│   (Browser)  │   + Authorization Header  │    Server    │
└──────────────┘                           └──────────────┘
                                                  │
                                                  │ 2. Middleware Stack
                                                  │    - CORS
                                                  │    - Helmet (Security Headers)
                                                  │    - JSON Parser
                                                  ▼
                                           ┌──────────────┐
                                           │  Auth        │
                                           │  Middleware  │
                                           └──────────────┘
                                                  │
                                                  │ 3. Verify JWT with Supabase
                                                  │    supabase.auth.getUser(token)
                                                  ▼
                                           ┌──────────────┐
                                           │   Supabase   │
                                           │   Auth       │
                                           └──────────────┘
                                                  │
                                                  │ 4. Extract user_id
                                                  │    Attach to req.userId
                                                  ▼
                                           ┌──────────────┐
                                           │    Route     │
                                           │   Handler    │
                                           └──────────────┘
                                                  │
                                                  │ 5. Query database
                                                  │    Filter by user_id
                                                  ▼
                                           ┌──────────────┐
                                           │   Supabase   │
                                           │   Database   │
                                           └──────────────┘
                                                  │
                                                  │ 6. Return results
                                                  ▼
                                           ┌──────────────┐
┌──────────────┐     7. JSON Response      │    Express   │
│    Client    │ ◄─────────────────────────│    Server    │
└──────────────┘                           └──────────────┘
```

---

## Authentication

### How JWT Verification Works

1. Client includes JWT in `Authorization` header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Auth middleware extracts the token

3. Token is verified using Supabase Auth:
   ```javascript
   const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
   ```

4. If valid, user info is attached to the request:
   ```javascript
   req.user = user;      // Full user object
   req.userId = user.id; // User UUID
   ```

5. Route handlers use `req.userId` (never from request body)

### Security Guarantees

| Scenario | Result |
|----------|--------|
| No Authorization header | 401 Unauthorized |
| Malformed header (no Bearer) | 401 Unauthorized |
| Invalid JWT signature | 401 Unauthorized |
| Expired JWT | 401 Unauthorized |
| Valid JWT | Request proceeds with user context |

---

## API Endpoints

### Health Check

#### `GET /health`

Returns the health status of the API and its dependencies.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "services": {
    "api": "ok",
    "database": "ok"
  }
}
```

---

### Tasks

#### `GET /tasks`

List all tasks for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Task title",
      "completed": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### `GET /tasks/:id`

Get a specific task by ID.

**Parameters:**
- `id` (path) - Task UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Task title",
    "completed": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `404 Not Found` - Task doesn't exist or belongs to another user

---

#### `POST /tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "Task title",
  "completed": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Task title (max 500 chars) |
| completed | boolean | No | Completion status (default: false) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Task title",
    "completed": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `400 Validation Error` - Invalid input

---

#### `PATCH /tasks/:id`

Update an existing task.

**Request Body:**
```json
{
  "title": "Updated title",
  "completed": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| completed | boolean | No | Updated completion status |

**Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { ... }
}
```

---

#### `DELETE /tasks/:id`

Delete a task.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Notes

#### `GET /notes`

List all notes for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "content": "Note content",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### `POST /notes`

Create a new note.

**Request Body:**
```json
{
  "content": "Note content"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Note content (max 10000 chars) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": { ... }
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | GET, PATCH requests |
| 201 | Created | POST requests |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Invalid/missing JWT |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database or internal error |

---

## Security Model

### Defense in Depth

The API implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: HTTPS + CORS                                           │
│   - All traffic encrypted                                       │
│   - Only allowed origins can make requests                      │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: Helmet Security Headers                                │
│   - XSS protection                                              │
│   - Content Security Policy                                     │
│   - HSTS                                                        │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: JWT Verification                                       │
│   - Token must be valid and not expired                         │
│   - User identity extracted from token                          │
├─────────────────────────────────────────────────────────────────┤
│ Layer 4: Application-Level Authorization                        │
│   - All queries filter by user_id                              │
│   - user_id comes from JWT, never request body                 │
├─────────────────────────────────────────────────────────────────┤
│ Layer 5: Database Row Level Security                            │
│   - RLS policies enforce user isolation                         │
│   - Even admin client queries are filtered                      │
└─────────────────────────────────────────────────────────────────┘
```

### Why user_id from JWT?

```
❌ BAD: Trust user_id from request body
   POST /tasks { "user_id": "hacker-id", "title": "..." }
   → Attacker could create tasks for any user

✅ GOOD: Extract user_id from verified JWT
   req.userId = user.id; // From verified token
   → User can only affect their own data
```

---

## Rate Limiting (Future)

For production, consider adding rate limiting:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

app.use(limiter);
```

---

## Testing

### Manual Testing with cURL

```bash
# Health check
curl http://localhost:3001/health

# Create task (requires valid token)
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Test task"}'

# List tasks
curl http://localhost:3001/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Getting a Test Token

1. Sign up/login via Supabase Auth in your frontend
2. Extract the access token from the session
3. Use in cURL requests

Or use Supabase Dashboard → SQL Editor:
```sql
-- Get a test token (development only)
SELECT auth.jwt();
```
