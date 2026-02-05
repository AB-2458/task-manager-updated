/**
 * Error Handling Middleware
 * 
 * Centralized error handling for consistent API responses.
 */

/**
 * Not Found Handler
 * Catches requests to undefined routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}

/**
 * Global Error Handler
 * Catches all errors thrown in route handlers
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Don't leak error details in production
  const response = {
    error: err.name || 'Error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : message,
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped handler with error catching
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default { notFoundHandler, errorHandler, asyncHandler };
