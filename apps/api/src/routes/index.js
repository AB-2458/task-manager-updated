/**
 * Routes Index
 * 
 * Aggregates and exports all route modules.
 */

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import tasksRoutes from './tasks.js';
import notesRoutes from './notes.js';
import healthRoutes from './health.js';

const router = Router();

// Health check - public (no auth required)
router.use('/health', healthRoutes);

// Protected routes - require valid JWT
router.use('/tasks', verifyToken, tasksRoutes);
router.use('/notes', verifyToken, notesRoutes);

export default router;
