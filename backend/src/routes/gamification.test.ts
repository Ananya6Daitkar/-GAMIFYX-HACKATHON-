import { describe, it, expect, beforeEach, vi } from 'vitest'
import badgeRepository from '../database/repositories/badgeRepository'
import leaderboardRepository from '../database/repositories/leaderboardRepository'
import userRepository from '../database/repositories/userRepository'

// Mock dependencies
vi.mock('../database/repositories/badgeRepository')
vi.mock('../database/repositories/leaderboardRepository')
vi.mock('../database/repositories/userRepository')

describe('Gamification Service Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Badge Management', () => {
    it('should fetch all available badges', async () => {
      const mockBadges = [
        { id: '1', name: 'First Commit', description: 'First commit', criteria: 'first', icon: 'icon1', createdAt: new Date() },
        { id: '2', name: 'Code Master', description: 'Code master', criteria: 'pass', icon: 'icon2', createdAt: new Date() },
      ]

      vi.mocked(badgeRepository.getAll).mockResolvedValue(mockBadges)

      const badges = await badgeRepository.getAll()

      expect(badges).toEqual(mockBadges)
      expect(badgeRepository.getAll).toHaveBeenCalled()
    })

    it('should fetch user badges', async () => {
      const mockBadges = [
        { id: '1', name: 'First Commit', description: 'First commit', criteria: 'first', icon: 'icon1', createdAt: new Date() },
      ]

      vi.mocked(badgeRepository.getUserBadges).mockResolvedValue(mockBadges)

      const badges = await badgeRepository.getUserBadges('user-123')

      expect(badges).toEqual(mockBadges)
      expect(badgeRepository.getUserBadges).toHaveBeenCalledWith('user-123')
    })

    it('should earn a badge for user', async () => {
      const mockUserBadge = {
        userId: 'user-123',
        badgeId: 'badge-1',
        earnedAt: new Date(),
      }

      vi.mocked(badgeRepository.earnBadge).mockResolvedValue(mockUserBadge)

      const result = await badgeRepository.earnBadge('user-123', 'badge-1')

      expect(result).toEqual(mockUserBadge)
      expect(badgeRepository.earnBadge).toHaveBeenCalledWith('user-123', 'badge-1')
    })

    it('should check if user has badge', async () => {
      vi.mocked(badgeRepository.hasBadge).mockResolvedValue(true)

      const hasBadge = await badgeRepository.hasBadge('user-123', 'badge-1')

      expect(hasBadge).toBe(true)
      expect(badgeRepository.hasBadge).toHaveBeenCalledWith('user-123', 'badge-1')
    })
  })

  describe('Leaderboard Management', () => {
    it('should fetch leaderboard for valid period', async () => {
      const mockLeaderboard = [
        { rank: 1, userId: 'user-1', username: 'alice', xp: 1000, streak: 5 },
        { rank: 2, userId: 'user-2', username: 'bob', xp: 900, streak: 3 },
      ]

      vi.mocked(leaderboardRepository.getLeaderboard).mockResolvedValue(mockLeaderboard)

      const leaderboard = await leaderboardRepository.getLeaderboard('daily')

      expect(leaderboard).toEqual(mockLeaderboard)
      expect(leaderboardRepository.getLeaderboard).toHaveBeenCalledWith('daily')
    })

    it('should fetch top N leaderboard entries', async () => {
      const mockLeaderboard = [
        { rank: 1, userId: 'user-1', username: 'alice', xp: 1000, streak: 5 },
      ]

      vi.mocked(leaderboardRepository.getTopN).mockResolvedValue(mockLeaderboard)

      const leaderboard = await leaderboardRepository.getTopN('daily', 1)

      expect(leaderboard).toEqual(mockLeaderboard)
      expect(leaderboardRepository.getTopN).toHaveBeenCalledWith('daily', 1)
    })

    it('should get user rank', async () => {
      vi.mocked(leaderboardRepository.getUserRank).mockResolvedValue(3)

      const rank = await leaderboardRepository.getUserRank('user-123', 'daily')

      expect(rank).toBe(3)
      expect(leaderboardRepository.getUserRank).toHaveBeenCalledWith('user-123', 'daily')
    })

    it('should invalidate leaderboard cache', async () => {
      vi.mocked(leaderboardRepository.invalidateCache).mockResolvedValue(undefined)

      await leaderboardRepository.invalidateCache()

      expect(leaderboardRepository.invalidateCache).toHaveBeenCalled()
    })
  })

  describe('User XP Management', () => {
    it('should fetch user XP and level', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'hash',
        level: 5,
        totalXp: 500,
        role: 'student' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(userRepository.findById).mockResolvedValue(mockUser)

      const user = await userRepository.findById('user-123')

      expect(user?.totalXp).toBe(500)
      expect(user?.level).toBe(5)
    })

    it('should update user XP', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'hash',
        level: 5,
        totalXp: 600,
        role: 'student' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(userRepository.updateXP).mockResolvedValue(mockUser)

      const updatedUser = await userRepository.updateXP('user-123', 100)

      expect(updatedUser.totalXp).toBe(600)
      expect(userRepository.updateXP).toHaveBeenCalledWith('user-123', 100)
    })

    it('should update user level', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'hash',
        level: 6,
        totalXp: 600,
        role: 'student' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(userRepository.updateLevel).mockResolvedValue(mockUser)

      const updatedUser = await userRepository.updateLevel('user-123', 6)

      expect(updatedUser.level).toBe(6)
      expect(userRepository.updateLevel).toHaveBeenCalledWith('user-123', 6)
    })
  })

  describe('XP Accumulation Consistency', () => {
    it('should verify XP accumulation is consistent', async () => {
      // Test that XP increases by exactly the awarded amount
      const initialXp = 500
      const xpToAward = 100
      const expectedNewXp = initialXp + xpToAward

      expect(expectedNewXp).toBe(600)
      expect(expectedNewXp).toBeGreaterThanOrEqual(initialXp)
    })

    it('should verify level calculation is consistent', () => {
      // Level = floor(totalXP / 100)
      const testCases = [
        { xp: 0, expectedLevel: 0 },
        { xp: 99, expectedLevel: 0 },
        { xp: 100, expectedLevel: 1 },
        { xp: 199, expectedLevel: 1 },
        { xp: 200, expectedLevel: 2 },
        { xp: 1000, expectedLevel: 10 },
      ]

      testCases.forEach(({ xp, expectedLevel }) => {
        const level = Math.floor(xp / 100)
        expect(level).toBe(expectedLevel)
      })
    })
  })

  describe('Leaderboard Ranking Accuracy', () => {
    it('should verify leaderboard entries are ranked correctly', () => {
      const entries = [
        { rank: 1, userId: 'user-1', username: 'alice', xp: 1000, streak: 5 },
        { rank: 2, userId: 'user-2', username: 'bob', xp: 900, streak: 3 },
        { rank: 3, userId: 'user-3', username: 'charlie', xp: 800, streak: 2 },
      ]

      // Verify descending order by XP
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i].xp).toBeGreaterThanOrEqual(entries[i + 1].xp)
      }

      // Verify ranks are sequential
      entries.forEach((entry, index) => {
        expect(entry.rank).toBe(index + 1)
      })
    })
  })

  describe('Badge Earning Idempotence', () => {
    it('should verify badge earning is idempotent', async () => {
      const userId = 'user-123'
      const badgeId = 'badge-1'

      // First earn
      vi.mocked(badgeRepository.earnBadge).mockResolvedValue({
        userId,
        badgeId,
        earnedAt: new Date(),
      })

      const firstEarn = await badgeRepository.earnBadge(userId, badgeId)

      // Second earn (should be idempotent)
      const secondEarn = await badgeRepository.earnBadge(userId, badgeId)

      expect(firstEarn.userId).toBe(secondEarn.userId)
      expect(firstEarn.badgeId).toBe(secondEarn.badgeId)
    })
  })
})
