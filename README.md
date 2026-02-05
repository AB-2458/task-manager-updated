# Task Manager

A modern, full-stack task management application built with React and Supabase.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- 🔐 **Secure Authentication** - Email/password auth with Supabase
- ✅ **Task Management** - Create, update, complete, and delete tasks
- 📝 **Notes** - Keep quick notes alongside your tasks
- 🔒 **Data Privacy** - Row Level Security ensures users only see their data
- ⚡ **Real-time Updates** - Instant sync across devices (coming soon)
- 📱 **Responsive Design** - Works on desktop and mobile

---

## 🏗️ Project Structure

```
task-manager-updated/
├── apps/
│   ├── web/                 # Frontend React application
│   └── api/                 # Backend API (if needed)
│
├── packages/
│   ├── shared/              # Shared utilities & types
│   ├── config/              # Shared configurations
│   └── ui/                  # Shared UI components
│
├── docs/
│   ├── architecture.md      # System architecture
│   ├── auth-flow.md         # Authentication details
│   ├── env-vars.md          # Environment variables guide
│   └── schema.md            # Database schema
│
├── supabase/
│   └── migrations/          # SQL migration files
│
└── scripts/                 # DevOps & utility scripts
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Supabase Account](https://supabase.com/) (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/task-manager-updated.git
cd task-manager-updated
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the migration files in order:
   - `supabase/migrations/001_create_tables.sql`
   - `supabase/migrations/002_enable_rls.sql`
   - `supabase/migrations/003_rls_policies.sql`
3. Enable **Email/Password** authentication in **Authentication** → **Providers**

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your Supabase credentials
# Get these from Supabase Dashboard → Settings → API
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design and component overview |
| [Auth Flow](docs/auth-flow.md) | Authentication and JWT details |
| [Schema](docs/schema.md) | Database tables and relationships |
| [Environment](docs/env-vars.md) | Environment variables guide |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite / Next.js** - Build tool
- **Tailwind CSS** - Styling

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row Level Security** - Data isolation

### DevOps
- **Vercel / Netlify** - Frontend hosting
- **Supabase Cloud** - Backend hosting
- **GitHub Actions** - CI/CD (planned)

---

## 🔒 Security

This project implements security best practices:

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Row Level Security** - Database-level access control
- ✅ **Environment Variables** - Secrets never in code
- ✅ **HTTPS Only** - Encrypted communication
- ✅ **Password Hashing** - Handled by Supabase

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Amazing open-source Firebase alternative
- [React](https://reactjs.org/) - The library for web interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
