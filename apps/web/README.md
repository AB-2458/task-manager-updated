# Task Manager Frontend

React + Vite frontend for the Task Manager application.

## Quick Start

### 1. Install Dependencies

```bash
cd apps/web
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

- 🔐 Authentication (login, register, logout)
- ✅ Task management (create, complete, delete)
- 📝 Notes management (create, edit, delete)
- 🌙 Dark/light mode toggle
- 📱 Responsive design (mobile drawer, desktop sidebar)
- ⚡ Optimistic UI updates

---

## Architecture

```
React App → Supabase Auth (get JWT) → Express Backend → Supabase Database
```

- **Supabase**: Used ONLY for authentication
- **Express Backend**: Handles all data operations
- **JWT**: Automatically attached to API requests

---

## Folder Structure

```
src/
├── components/       # UI components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── TaskList.tsx
│   ├── NoteList.tsx
│   └── ProtectedRoute.tsx
├── context/          # React Context
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/              # Utilities
│   ├── api.ts        # Backend API client
│   └── supabase.ts   # Supabase auth client
├── pages/            # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── styles/           # CSS
│   └── index.css
├── types/            # TypeScript types
│   └── index.ts
├── App.tsx           # Main app with routing
└── main.tsx          # Entry point
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
