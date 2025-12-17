import { describe, it, expect, beforeEach, vi } from 'vitest'
import { errorHandler, notFoundHandler, asyncHandler, AppError } from './errorHandler'
import { Request, Response, NextFunction } from 'express'

describe('Error Handler Middleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {
      path: '/api/test',
      method: 'GET',
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    }
    next = vi.fn()
  })

  describe('errorHandler', () => {
    it('should return 500 status for generic errors', () => {
      const error = new Error('Something went wrong') as AppError
      error.status = 500

      errorHandler(error, req as Request, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            status: 500,
            message: 'Something went wrong',
          }),
        })
      )
    })

    it('should return 400 status for validation errors', () => {
      const error = new Error('Invalid input') as AppError
      error.status = 400
      error.code = 'VALIDATION_ERROR'

      errorHandler(error, req as Request, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            status: 400,
            code: 'VALIDATION_ERROR',
          }),
        })
      )
    })

    it('should include timestamp in error response', () => {
      const error = new Error('Test error') as AppError
      error.status = 500

      errorHandler(error, req as Request, res as Response, next)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        })
      )
    })

    it('should default to 500 status when not specified', () => {
      const error = new Error('Unknown error') as AppError

      errorHandler(error, req as Request, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('should use INTERNAL_ERROR code when not specified', () => {
      const error = new Error('Test error') as AppError

      errorHandler(error, req as Request, res as Response, next)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
          }),
        })
      )
    })
  })

  describe('notFoundHandler', () => {
    it('should return 404 status with route information', () => {
      notFoundHandler(req as Request, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            status: 404,
            code: 'NOT_FOUND',
            message: expect.stringContaining('GET /api/test'),
          }),
        })
      )
    })

    it('should include timestamp in 404 response', () => {
      notFoundHandler(req as Request, res as Response, next)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        })
      )
    })
  })

  describe('asyncHandler', () => {
    it('should catch errors from async route handlers', async () => {
      const error = new Error('Async error')
      const asyncFn = vi.fn().mockRejectedValue(error)
      const wrapped = asyncHandler(asyncFn)

      wrapped(req as Request, res as Response, next)

      // Give promise time to resolve
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error when async function throws', async () => {
      const error = new Error('Test error')
      const asyncFn = vi.fn(async () => {
        throw error
      })
      const wrapped = asyncHandler(asyncFn)

      wrapped(req as Request, res as Response, next)

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(next).toHaveBeenCalledWith(error)
    })

    it('should execute async function successfully', async () => {
      const asyncFn = vi.fn(async () => {
        res.json!({ success: true })
      })
      const wrapped = asyncHandler(asyncFn)

      wrapped(req as Request, res as Response, next)

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(asyncFn).toHaveBeenCalled()
    })
  })
})
