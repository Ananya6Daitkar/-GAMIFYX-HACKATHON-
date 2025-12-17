import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  status?: number
  code?: string
  details?: any
}

/**
 * Global error handling middleware
 * Catches all errors thrown in route handlers and formats them consistently
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  const isDevelopment = process.env.NODE_ENV !== 'production'

  // Log error details
  console.error(`[${status}] ${message}`, {
    path: req.path,
    method: req.method,
    error: err,
    timestamp: new Date().toISOString(),
  })

  // Prepare error response
  const errorResponse: any = {
    error: {
      status,
      message,
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
  }

  // Include details in development mode
  if (isDevelopment && err.details) {
    errorResponse.error.details = err.details
  }

  res.status(status).json(errorResponse)
}

/**
 * 404 Not Found handler
 * Catches requests to non-existent routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  res.status(404).json({
    error: {
      status: 404,
      message: `Route not found: ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Async error wrapper for route handlers
 * Wraps async route handlers to catch errors and pass to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
