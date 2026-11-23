/**
 * Error Handling Middleware
 * Centralized error handling for Express
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Default to 500 Internal Server Error
  let status = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = err.message;
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = err.message;
  } else if (err.name === 'NotFoundError') {
    status = 404;
    message = err.message;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    res.status(status).json({
      error: message,
      stack: err.stack,
    });
  } else {
    res.status(status).json({ error: message });
  }
}

/**
 * Async wrapper for route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}