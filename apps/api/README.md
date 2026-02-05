# Task Manager API

Express backend API with Supabase JWT authentication.

## Quick Start

### 1. Install Dependencies

```bash
cd apps/api
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your Supabase credentials
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001`

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks |
| GET | `/tasks/:id` | Get a specific task |
| POST | `/tasks` | Create a new task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/notes` | List all notes |
| GET | `/notes/:id` | Get a specific note |
| POST | `/notes` | Create a new note |
| PATCH | `/notes/:id` | Update a note |
| DELETE | `/notes/:id` | Delete a note |

---

## Authentication

All protected endpoints require a valid JWT from Supabase Auth.

### Request Format

```
Authorization: Bearer <supabase_access_token>
```

### Example Request

```bash
curl -X GET http://localhost:3001/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Missing Authorization header | No token provided |
| 401 | Invalid or expired token | Token verification failed |

---

## Request/Response Examples

### Create Task

**Request:**
```bash
POST /tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Complete project documentation",
  "completed": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": "user-uuid-here",
    "title": "Complete project documentation",
    "completed": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### List Tasks

**Request:**
```bash
GET /tasks
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "user_id": "user-uuid-here",
      "title": "Complete project documentation",
      "completed": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

## Folder Structure

```
apps/api/
├── src/
│   ├── config/
│   │   └── index.js        # Environment configuration
│   ├── lib/
│   │   └── supabase.js     # Supabase client
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   └── errorHandler.js # Error handling
│   ├── routes/
│   │   ├── index.js        # Route aggregation
│   │   ├── tasks.js        # Task endpoints
│   │   ├── notes.js        # Note endpoints
│   │   └── health.js       # Health check
│   └── index.js            # Server entry point
├── .env.example
├── package.json
└── README.md
```

---

## Security

### JWT Verification
- All protected routes verify JWTs using `supabase.auth.getUser()`
- Invalid or expired tokens are rejected with 401

### User ID Handling
- `user_id` is **ALWAYS** extracted from the verified JWT
- Request body `user_id` is **NEVER** trusted
- This prevents users from accessing other users' data

### Row Level Security
- Supabase RLS remains enabled on all tables
- Backend adds filter: `eq('user_id', userId)` for extra safety
- Even if RLS was bypassed, backend enforces user isolation

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |
| `CORS_ORIGINS` | No | Allowed CORS origins |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
