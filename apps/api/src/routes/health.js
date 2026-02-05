/**
 * Health Check Route
 * 
 * Provides endpoint for monitoring and load balancer health checks.
 */

import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

/**
 * GET /health
 * 
 * Returns the health status of the API and its dependencies.
 */
router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'ok',
      database: 'unknown',
    },
  };

  try {
    // Check database connectivity
    const { error } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .limit(1);

    health.services.database = error ? 'error' : 'ok';
    
    if (error) {
      health.status = 'degraded';
      console.error('Database health check failed:', error.message);
    }
  } catch (error) {
    health.status = 'degraded';
    health.services.database = 'error';
    console.error('Database health check error:', error);
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
