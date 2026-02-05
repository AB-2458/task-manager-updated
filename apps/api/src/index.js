/**
 * Task Manager API Server
 * 
 * Express server with Supabase JWT authentication.
 * 
 * Request Lifecycle:
 * 1. Client sends request with JWT in Authorization header
 * 2. Express receives request, applies CORS, security headers
 * 3. Auth middleware verifies JWT with Supabase
 * 4. Route handler processes request, queries Supabase
 * 5. Response sent back to client
 * 
 * Security:
 * - All protected routes require valid Supabase JWT
 * - user_id is extracted from JWT, never from request body
 * - Supabase RLS provides additional database-level security
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Create Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// ROUTES
// ============================================

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Task Manager API',
    version: '1.0.0',
    status: 'running',
    documentation: '/health',
    endpoints: {
      health: 'GET /health',
      tasks: {
        list: 'GET /tasks',
        get: 'GET /tasks/:id',
        create: 'POST /tasks',
        update: 'PATCH /tasks/:id',
        delete: 'DELETE /tasks/:id',
      },
      notes: {
        list: 'GET /notes',
        get: 'GET /notes/:id',
        create: 'POST /notes',
        update: 'PATCH /notes/:id',
        delete: 'DELETE /notes/:id',
      },
    },
  });
});

// Mount API routes
app.use(routes);

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const server = app.listen(config.port, () => {
  console.log('');
  console.log('🚀 Task Manager API Server');
  console.log('═══════════════════════════════════════');
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Port:        ${config.port}`);
  console.log(`   URL:         http://localhost:${config.port}`);
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('📍 Endpoints:');
  console.log(`   GET  /           API info`);
  console.log(`   GET  /health     Health check`);
  console.log(`   GET  /tasks      List tasks (auth required)`);
  console.log(`   POST /tasks      Create task (auth required)`);
  console.log(`   GET  /notes      List notes (auth required)`);
  console.log(`   POST /notes      Create note (auth required)`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;
