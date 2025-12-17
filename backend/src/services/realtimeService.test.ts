import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { XPEvent, LeaderboardEntry, AIFeedback, Submission } from '../database/models'
import realtimeService from './realtimeService'

// Mock Socket.io
vi.mock('socket.io')

describe('RealtimeService', () => {
  let mockIO: any
  let mockSocket: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock Socket.io server
    mockSocket = {
      id: 'socket-1',
      on: vi.fn(),
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
    }

    mockIO = {
      on: vi.fn((event, callback) => {
        if (event === 'connection') {
          callback(mockSocket)
        }
      }),
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
    }

    // Reset the service state
    realtimeService.initialize(mockIO)
  })

  describe('initialize', () => {
    it('should initialize Socket.io server', () => {
      expect(mockIO.on).toHaveBeenCalledWith('connection', expect.any(Function))
    })

    it('should handle user authentication', () => {
      const userId = 'user-1'
      const authenticateCallback = mockIO.on.mock.calls[0][1]

      // Simulate connection
      authenticateCallback(mockSocket)

      // Get the authenticate handler
      const authenticateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticate'
      )?.[1]

      expect(authenticateHandler).toBeDefined()

      // Call authenticate
      authenticateHandler(userId)

      expect(realtimeService.isUserConnected(userId)).toBe(true)
    })
  })

  describe('broadcastXPEvent', () => {
    it('should broadcast XP event to all connected clients', () => {
      const event: XPEvent = {
        userId: 'user-1',
        amount: 100,
        reason: 'Submission approved',
        timestamp: new Date(),
      }

      realtimeService.broadcastXPEvent(event)

      expect(mockIO.emit).toHaveBeenCalledWith('xp:earned', expect.objectContaining({
        userId: 'user-1',
        amount: 100,
        reason: 'Submission approved',
      }))
    })

    it('should handle uninitialized Socket.io gracefully', () => {
      const service = Object.create(Object.getPrototypeOf(realtimeService))
      const event: XPEvent = {
        userId: 'user-1',
        amount: 100,
        reason: 'Test',
        timestamp: new Date(),
      }

      // Should not throw
      expect(() => service.broadcastXPEvent(event)).not.toThrow()
    })
  })

  describe('broadcastLeaderboardUpdate', () => {
    it('should broadcast leaderboard update to all clients', () => {
      const entries: LeaderboardEntry[] = [
        { rank: 1, userId: 'user-1', username: 'alice', xp: 1000, streak: 5 },
        { rank: 2, userId: 'user-2', username: 'bob', xp: 900, streak: 3 },
      ]

      realtimeService.broadcastLeaderboardUpdate('daily', entries)

      expect(mockIO.emit).toHaveBeenCalledWith('leaderboard:updated', expect.objectContaining({
        period: 'daily',
        entries,
      }))
    })
  })

  describe('broadcastRankChange', () => {
    it('should broadcast rank change for a user', () => {
      realtimeService.broadcastRankChange('user-1', 'daily', 2, 3)

      expect(mockIO.emit).toHaveBeenCalledWith('leaderboard:rankChanged', expect.objectContaining({
        userId: 'user-1',
        period: 'daily',
        newRank: 2,
        previousRank: 3,
      }))
    })
  })

  describe('notifyFeedbackAvailable', () => {
    it('should send feedback notification to specific user', () => {
      const userId = 'user-1'
      const feedback: AIFeedback = {
        id: 'feedback-1',
        submissionId: 'submission-1',
        insights: ['Good code structure'],
        confidenceScore: 85,
        codeReferences: [],
        generatedAt: new Date(),
      }

      // Register user socket
      const authenticateCallback = mockIO.on.mock.calls[0][1]
      authenticateCallback(mockSocket)
      const authenticateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticate'
      )?.[1]
      authenticateHandler(userId)

      realtimeService.notifyFeedbackAvailable(userId, feedback, 'submission-1')

      expect(mockIO.to).toHaveBeenCalledWith('socket-1')
    })

    it('should handle notification when user is not connected', () => {
      const userId = 'user-not-connected'
      const feedback: AIFeedback = {
        id: 'feedback-1',
        submissionId: 'submission-1',
        insights: ['Good code structure'],
        confidenceScore: 85,
        codeReferences: [],
        generatedAt: new Date(),
      }

      // Should not throw
      expect(() => realtimeService.notifyFeedbackAvailable(userId, feedback, 'submission-1')).not.toThrow()
    })
  })

  describe('broadcastSubmissionStatusUpdate', () => {
    it('should broadcast submission status update to all clients', () => {
      const submission: Submission = {
        id: 'submission-1',
        studentId: 'user-1',
        code: 'console.log("hello")',
        language: 'javascript',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      realtimeService.broadcastSubmissionStatusUpdate(submission)

      expect(mockIO.emit).toHaveBeenCalledWith('submission:statusChanged', expect.objectContaining({
        submissionId: 'submission-1',
        status: 'approved',
      }))
    })
  })

  describe('notifySubmissionStatusUpdate', () => {
    it('should send submission status update to specific user', () => {
      const userId = 'user-1'
      const submission: Submission = {
        id: 'submission-1',
        studentId: userId,
        code: 'console.log("hello")',
        language: 'javascript',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Register user socket
      const authenticateCallback = mockIO.on.mock.calls[0][1]
      authenticateCallback(mockSocket)
      const authenticateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticate'
      )?.[1]
      authenticateHandler(userId)

      realtimeService.notifySubmissionStatusUpdate(userId, submission)

      expect(mockIO.to).toHaveBeenCalledWith('socket-1')
    })
  })

  describe('notifyBadgeEarned', () => {
    it('should send badge earned notification to specific user', () => {
      const userId = 'user-1'

      // Register user socket
      const authenticateCallback = mockIO.on.mock.calls[0][1]
      authenticateCallback(mockSocket)
      const authenticateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticate'
      )?.[1]
      authenticateHandler(userId)

      realtimeService.notifyBadgeEarned(userId, 'First Commit', 'badge-icon-url')

      expect(mockIO.to).toHaveBeenCalledWith('socket-1')
    })
  })

  describe('notifyLevelUp', () => {
    it('should send level up notification to specific user', () => {
      const userId = 'user-1'

      // Register user socket
      const authenticateCallback = mockIO.on.mock.calls[0][1]
      authenticateCallback(mockSocket)
      const authenticateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticate'
      )?.[1]
      authenticateHandler(userId)

      realtimeService.notifyLevelUp(userId, 5, 500)

      expect(mockIO.to).toHaveBeenCalledWith('socket-1')
    })
  })

  describe('notifyUser', () => {
    it('should send generic notification to specific user', () => {
      const userId = 'user-1'

      // Register user socket
      const authenticateCallback = mockIO.on.mock.calls[0][1]
      authenticateCallback(mockSocket)
      const authenticateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticate'
      )?.[1]
      authenticateHandler(userId)

      realtimeService.notifyUser(userId, 'test:notification', 'Test message', { data: 'test' })

      expect(mockIO.to).toHaveBeenCalledWith('socket-1')
    })
  })

  describe('getConnectedUserCount', () => {
    it('should return number of connected users', () => {
      const authenticateCallback = mockIO.on.mock.calls[0][1]
      authenticateCallback(mockSocket)
      const authenticateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticate'
      )?.[1]

      authenticateHandler('user-1')
      authenticateHandler('user-2')

      expect(realtimeService.getConnectedUserCount()).toBe(2)
    })
  })

  describe('isUserConnected', () => {
    it('should return true if user is connected', () => {
      const authenticateCallback = mockIO.on.mock.calls[0][1]
      authenticateCallback(mockSocket)
      const authenticateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticate'
      )?.[1]

      authenticateHandler('user-1')

      expect(realtimeService.isUserConnected('user-1')).toBe(true)
    })

    it('should return false if user is not connected', () => {
      expect(realtimeService.isUserConnected('user-not-connected')).toBe(false)
    })
  })
})
