import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  user?: any
  role?: string
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 * Requires: Authorization: Bearer <token>
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'No authorization header provided',
          code: 'NO_AUTH_HEADER',
        },
      })
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Invalid authorization header format. Expected: Bearer <token>',
          code: 'INVALID_AUTH_FORMAT',
        },
      })
    }

    const token = parts[1]
    const jwtSecret = process.env.JWT_SECRET || 'secret'
    
    const decoded = jwt.verify(token, jwtSecret) as any
    req.userId = decoded.userId
    req.user = decoded
    req.role = decoded.role

    return next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        },
      })
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        },
      })
    }

    return res.status(401).json({
      error: {
        status: 401,
        message: 'Authentication failed',
        code: 'AUTH_FAILED',
      },
    })
  }
}

/**
 * Optional JWT Authentication Middleware
 * Attempts to verify JWT token but doesn't fail if missing or invalid
 * Useful for endpoints that work with or without authentication
 */
export function optionalAuthMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (authHeader) {
      const parts = authHeader.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1]
        const jwtSecret = process.env.JWT_SECRET || 'secret'
        
        const decoded = jwt.verify(token, jwtSecret) as any
        req.userId = decoded.userId
        req.user = decoded
        req.role = decoded.role
      }
    }

    next()
  } catch (err) {
    // Silently ignore auth errors for optional auth
    next()
  }
}

/**
 * Role-based Access Control Middleware
 * Restricts access to specific user roles
 * Usage: app.use('/admin', roleMiddleware('admin'))
 */
export function roleMiddleware(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
        },
      })
    }

    next()
  }
}
