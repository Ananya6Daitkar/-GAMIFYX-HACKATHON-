import { describe, it, expect, beforeEach, vi } from 'vitest'
import focusSessionService from './focusSessionService'
import focusSessionRepository from '../database/repositories/focusSessionRepository'
import userRepository from '../database/repositories/userRepository'

// Mock repositories
vi.mock('../database/repositories/focusSessionRepository')
vi.mock('../database/repositories/userRepository')

describe('FocusSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('startSession', () => {
    it('should create a new focus session for a valid user', async () => {
      const userId = 'test-user-id'
      const mockUser = { id: userId, username: 'testuser' }
      const mockSession = {
        id: 'session-1',
        userId,
        startTime: new Date(),
        status: 'active' as const,
      }

      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any)
      vi.mocked(focusSessionRepository.create).mockResolvedValue(mockSession as any)

      const result = await focusSessionService.startSession(userId)

      expect(result.id).toBe('session-1')
      expect(result.status).toBe('active')
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(focusSessionRepository.create).toHaveBeenCalled()
    })

    it('should throw error if user does not exist', async () => {
      const userId = 'invalid-user'
      vi.mocked(userRepository.findById).mockResolvedValue(null)

      await expect(focusSessionService.startSession(userId)).rejects.toThrow(
        'User not found'
      )
    })
  })

  describe('endSession', () => {
    it('should end session and award XP', async () => {
      const sessionId = 'session-1'
      const userId = 'user-1'
      const mockSession = {
        id: sessionId,
        userId,
        startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        status: 'active' as const,
      }
      const mockCompletedSession = {
        ...mockSession,
        endTime: new Date(),
        duration: 300,
        xpReward: 5,
        status: 'completed' as const,
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession as any)
      vi.mocked(focusSessionRepository.endSession).mockResolvedValue(
        mockCompletedSession as any
      )
      vi.mocked(userRepository.updateXP).mockResolvedValue({} as any)

      const result = await focusSessionService.endSession(sessionId, userId, 0)

      expect(result.session.status).toBe('completed')
      expect(result.xpAwarded).toBeGreaterThanOrEqual(5)
      expect(userRepository.updateXP).toHaveBeenCalledWith(userId, result.xpAwarded)
    })

    it('should apply streak bonus to XP reward', async () => {
      const sessionId = 'session-1'
      const userId = 'user-1'
      const streakDays = 5
      const mockSession = {
        id: sessionId,
        userId,
        startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        status: 'active' as const,
      }
      const mockCompletedSession = {
        ...mockSession,
        endTime: new Date(),
        duration: 600,
        xpReward: 11, // 10 minutes * (1 + 0.5 streak bonus)
        status: 'completed' as const,
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession as any)
      vi.mocked(focusSessionRepository.endSession).mockResolvedValue(
        mockCompletedSession as any
      )
      vi.mocked(userRepository.updateXP).mockResolvedValue({} as any)

      const result = await focusSessionService.endSession(sessionId, userId, streakDays)

      expect(result.xpAwarded).toBeGreaterThan(10) // Should have streak bonus
    })

    it('should throw error if session not found', async () => {
      const sessionId = 'invalid-session'
      const userId = 'user-1'

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(null)

      await expect(focusSessionService.endSession(sessionId, userId)).rejects.toThrow(
        'Focus session not found'
      )
    })

    it('should throw error if session does not belong to user', async () => {
      const sessionId = 'session-1'
      const userId = 'user-1'
      const mockSession = {
        id: sessionId,
        userId: 'different-user',
        startTime: new Date(),
        status: 'active' as const,
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession as any)

      await expect(focusSessionService.endSession(sessionId, userId)).rejects.toThrow(
        'Unauthorized'
      )
    })

    it('should throw error if session is not active', async () => {
      const sessionId = 'session-1'
      const userId = 'user-1'
      const mockSession = {
        id: sessionId,
        userId,
        startTime: new Date(),
        status: 'completed' as const,
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession as any)

      await expect(focusSessionService.endSession(sessionId, userId)).rejects.toThrow(
        'Session is not active'
      )
    })
  })

  describe('calculateXPReward', () => {
    it('should calculate XP based on duration', () => {
      const xp = focusSessionService.calculateXPReward(10, 0)
      expect(xp).toBe(10)
    })

    it('should apply streak bonus', () => {
      const xpNoStreak = focusSessionService.calculateXPReward(10, 0)
      const xpWithStreak = focusSessionService.calculateXPReward(10, 5)

      expect(xpWithStreak).toBeGreaterThan(xpNoStreak)
    })

    it('should cap streak bonus at 50%', () => {
      const xp10Days = focusSessionService.calculateXPReward(10, 10)
      const xp5Days = focusSessionService.calculateXPReward(10, 5)

      // 10 days should not give more bonus than 5 days (capped at 50%)
      expect(xp10Days).toBeLessThanOrEqual(xp5Days * 1.01) // Allow small rounding difference
    })

    it('should return minimum 5 XP', () => {
      const xp = focusSessionService.calculateXPReward(0, 0)
      expect(xp).toBe(5)
    })
  })

  describe('abandonSession', () => {
    it('should abandon a session without awarding XP', async () => {
      const sessionId = 'session-1'
      const userId = 'user-1'
      const mockSession = {
        id: sessionId,
        userId,
        startTime: new Date(),
        status: 'active' as const,
      }
      const mockAbandonedSession = {
        ...mockSession,
        status: 'abandoned' as const,
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession as any)
      vi.mocked(focusSessionRepository.abandonSession).mockResolvedValue(
        mockAbandonedSession as any
      )

      const result = await focusSessionService.abandonSession(sessionId, userId)

      expect(result.status).toBe('abandoned')
      expect(focusSessionRepository.abandonSession).toHaveBeenCalledWith(sessionId)
    })

    it('should throw error if session not found', async () => {
      const sessionId = 'invalid-session'
      const userId = 'user-1'

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(null)

      await expect(focusSessionService.abandonSession(sessionId, userId)).rejects.toThrow(
        'Focus session not found'
      )
    })
  })
})
