import express, { Router, Request, Response } from 'express'
import focusSessionService from '../services/focusSessionService'
import badgeRepository from '../database/repositories/badgeRepository'
import leaderboardRepository from '../database/repositories/leaderboardRepository'
import userRepository from '../database/repositories/userRepository'
import realtimeService from '../services/realtimeService'

const router = Router()

// Get all available badges
router.get('/badges', async (req: Request, res: Response) => {
  try {
    const badges = await badgeRepository.getAll()
    res.json(badges)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch badges' })
  }
})

// Get earned badges for current user
router.get('/badges/earned', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const badges = await badgeRepository.getUserBadges(userId)
    res.json(badges)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch earned badges' })
  }
})

// Get leaderboard
router.get('/leaderboard/:period', async (req: Request, res: Response) => {
  try {
    const { period } = req.params
    
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Must be daily, weekly, or monthly' })
    }

    const leaderboard = await leaderboardRepository.getLeaderboard(period as 'daily' | 'weekly' | 'monthly')
    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch leaderboard' })
  }
})

// Get top N leaderboard entries
router.get('/leaderboard/:period/top/:n', async (req: Request, res: Response) => {
  try {
    const { period, n } = req.params
    const topN = parseInt(n, 10)

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Must be daily, weekly, or monthly' })
    }

    if (isNaN(topN) || topN < 1) {
      return res.status(400).json({ error: 'Invalid n. Must be a positive integer' })
    }

    const leaderboard = await leaderboardRepository.getTopN(period as 'daily' | 'weekly' | 'monthly', topN)
    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch leaderboard' })
  }
})

// Get user badges
router.get('/badges/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const badges = await badgeRepository.getUserBadges(userId)
    res.json(badges)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user badges' })
  }
})

// Get user XP
router.get('/xp/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const user = await userRepository.findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      userId: user.id,
      totalXp: user.totalXp,
      level: user.level,
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user XP' })
  }
})

// Get user rank
router.get('/rank/:userId/:period', async (req: Request, res: Response) => {
  try {
    const { userId, period } = req.params

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Must be daily, weekly, or monthly' })
    }

    const rank = await leaderboardRepository.getUserRank(userId, period as 'daily' | 'weekly' | 'monthly')
    
    if (rank === null) {
      return res.status(404).json({ error: 'User not found in leaderboard' })
    }

    res.json({ userId, rank, period })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user rank' })
  }
})

// Award XP (admin only)
// Requirement 16.1
router.post('/xp/award', async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason } = req.body

    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid request. userId and positive amount are required' })
    }

    const user = await userRepository.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const previousLevel = user.level
    const updatedUser = await userRepository.updateXP(userId, amount)
    
    // Broadcast XP event to all connected clients
    // Property 1: XP Accumulation Consistency
    realtimeService.broadcastXPEvent({
      userId: updatedUser.id,
      amount,
      reason: reason || 'Manual award',
      timestamp: new Date(),
    })

    // Check if user leveled up
    if (updatedUser.level > previousLevel) {
      realtimeService.notifyLevelUp(userId, updatedUser.level, updatedUser.totalXp)
    }

    // Update leaderboard for all periods
    const dailyLeaderboard = await leaderboardRepository.getLeaderboard('daily')
    const weeklyLeaderboard = await leaderboardRepository.getLeaderboard('weekly')
    const monthlyLeaderboard = await leaderboardRepository.getLeaderboard('monthly')

    realtimeService.broadcastLeaderboardUpdate('daily', dailyLeaderboard.entries)
    realtimeService.broadcastLeaderboardUpdate('weekly', weeklyLeaderboard.entries)
    realtimeService.broadcastLeaderboardUpdate('monthly', monthlyLeaderboard.entries)
    
    res.json({
      userId: updatedUser.id,
      totalXp: updatedUser.totalXp,
      level: updatedUser.level,
      xpAwarded: amount,
      reason: reason || 'Manual award',
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to award XP' })
  }
})

// Focus Lock Mode Routes

// Start a focus session
router.post('/focus/start', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const session = await focusSessionService.startSession(userId)
    res.json(session)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to start session' })
  }
})

// End a focus session
router.post('/focus/end', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || (req as any).user?.id
    const { sessionId, streakDays } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    const result = await focusSessionService.endSession(sessionId, userId, streakDays || 0)
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to end session' })
  }
})

// Abandon a focus session
router.post('/focus/abandon', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || (req as any).user?.id
    const { sessionId } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    const session = await focusSessionService.abandonSession(sessionId, userId)
    res.json(session)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to abandon session' })
  }
})

// Get user's focus sessions
router.get('/focus/sessions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const sessions = await focusSessionService.getUserSessions(userId)
    res.json(sessions)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch sessions' })
  }
})

// Get user's active focus session
router.get('/focus/active/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const session = await focusSessionService.getUserActiveSession(userId)
    res.json(session || null)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch active session' })
  }
})

// Get user's total focus time
router.get('/focus/stats/time/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const totalMinutes = await focusSessionService.getUserTotalFocusTime(userId)
    res.json({ totalMinutes })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch focus time' })
  }
})

// Get user's total XP from focus sessions
router.get('/focus/stats/xp/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const totalXP = await focusSessionService.getUserFocusSessionXP(userId)
    res.json({ totalXP })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch focus XP' })
  }
})

// Calculate XP reward preview
router.post('/focus/calculate-xp', (req: Request, res: Response) => {
  try {
    const { durationMinutes, streakDays } = req.body

    if (typeof durationMinutes !== 'number' || durationMinutes < 0) {
      return res.status(400).json({ error: 'Invalid duration' })
    }

    const xpReward = focusSessionService.calculateXPReward(durationMinutes, streakDays || 0)
    res.json({ xpReward })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to calculate XP' })
  }
})

export default router
