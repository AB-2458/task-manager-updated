/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens issued by Supabase Auth.
 * Extracts user information and attaches it to the request object.
 * 
 * SECURITY: This middleware is the gatekeeper for all protected routes.
 * - Validates JWT signature and expiration
 * - Extracts user_id from the token (not from request body)
 * - Rejects requests without valid tokens
 */

import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Verify Supabase JWT and extract user
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function verifyToken(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing Authorization header',
      });
    }
    
    // Check Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid Authorization header format. Use: Bearer <token>',
      });
    }
    
    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing access token',
      });
    }
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.error('JWT verification failed:', error?.message || 'No user found');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
    
    // Attach user and token to request object
    // This is the ONLY trusted source of user identity
    req.user = user;
    req.userId = user.id;
    req.accessToken = token;
    
    // Log successful authentication (debug)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✓ Authenticated: ${user.email} (${user.id})`);
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication middleware
 * 
 * Attempts to verify the token but allows the request to proceed
 * even if authentication fails. Useful for public endpoints that
 * want to provide additional features for authenticated users.
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      req.userId = null;
      return next();
    }
    
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      // Invalid token, continue without authentication
      req.user = null;
      req.userId = null;
      return next();
    }
    
    // Valid token, attach user
    req.user = user;
    req.userId = user.id;
    req.accessToken = token;
    
    next();
  } catch (error) {
    // On error, continue without authentication
    req.user = null;
    req.userId = null;
    next();
  }
}

export default verifyToken;
