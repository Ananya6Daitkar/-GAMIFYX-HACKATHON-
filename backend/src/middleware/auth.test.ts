import { describe, it, expect, beforeEach, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import { authMiddleware, optionalAuthMiddleware, roleMiddleware, AuthRequest } from './auth'
import { Response, NextFunction } from 'express'

describe('Auth Middleware', () => {
  let req: Partial<AuthRequest>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {
      headers: {},
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
  })

  describe('authMiddleware', () => {
    it('should attach user info to request when valid token is provided', () => {
      const token = jwt.sign(
        { userId: 'user123', role: 'student' },
        process.env.JWT_SECRET || 'secret'
      )
      req.headers = { authorization: `Bearer ${token}` }

      authMiddleware(req as AuthRequest, res as Response, next)

      expect(req.userId).toBe('user123')
      expect(req.role).toBe('student')
      expect(next).toHaveBeenCalled()
    })

    it('should return 401 when no authorization header is provided', () => {
      authMiddleware(req as AuthRequest, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'NO_AUTH_HEADER',
          }),
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when authorization header format is invalid', () => {
      req.headers = { authorization: 'InvalidFormat token' }

      authMiddleware(req as AuthRequest, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INVALID_AUTH_FORMAT',
          }),
        })
      )
    })

    it('should return 401 when token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid.token.here' }

      authMiddleware(req as AuthRequest, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INVALID_TOKEN',
          }),
        })
      )
    })

    it('should return 401 when token is expired', () => {
      const expiredToken = jwt.sign(
        { userId: 'user123', role: 'student' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '-1h' }
      )
      req.headers = { authorization: `Bearer ${expiredToken}` }

      authMiddleware(req as AuthRequest, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'TOKEN_EXPIRED',
          }),
        })
      )
    })
  })

  describe('optionalAuthMiddleware', () => {
    it('should attach user info when valid token is provided', () => {
      const token = jwt.sign(
        { userId: 'user123', role: 'student' },
        process.env.JWT_SECRET || 'secret'
      )
      req.headers = { authorization: `Bearer ${token}` }

      optionalAuthMiddleware(req as AuthRequest, res as Response, next)

      expect(req.userId).toBe('user123')
      expect(next).toHaveBeenCalled()
    })

    it('should call next without attaching user info when no token is provided', () => {
      optionalAuthMiddleware(req as AuthRequest, res as Response, next)

      expect(req.userId).toBeUndefined()
      expect(next).toHaveBeenCalled()
    })

    it('should call next without attaching user info when token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid.token' }

      optionalAuthMiddleware(req as AuthRequest, res as Response, next)

      expect(req.userId).toBeUndefined()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('roleMiddleware', () => {
    it('should call next when user has allowed role', () => {
      req.role = 'teacher'
      const middleware = roleMiddleware('teacher', 'admin')

      middleware(req as AuthRequest, res as Response, next)

      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should return 403 when user does not have allowed role', () => {
      req.role = 'student'
      const middleware = roleMiddleware('teacher', 'admin')

      middleware(req as AuthRequest, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'FORBIDDEN',
          }),
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 403 when user role is not set', () => {
      const middleware = roleMiddleware('teacher')

      middleware(req as AuthRequest, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
