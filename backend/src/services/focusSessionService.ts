import { FocusSession } from '../database/models'
import focusSessionRepository from '../database/repositories/focusSessionRepository'
import userRepository from '../database/repositories/userRepository'

export class FocusSessionService {
  /**
   * Start a new focus session
   */
  async startSession(userId: string): Promise<FocusSession> {
    // Verify user exists
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Create new focus session
    return focusSessionRepository.create({
      userId,
      startTime: new Date(),
      status: 'active',
    })
  }

  /**
   * End a focus session and award XP
   * XP calculation: (duration in minutes × base rate) + (streak bonus if applicable)
   * Base rate: 1 XP per minute
   * Streak bonus: +10% per day streak
   */
  async endSession(
    sessionId: string,
    userId: string,
    streakDays: number = 0
  ): Promise<{ session: FocusSession; xpAwarded: number }> {
    // Get the session
    const session = await focusSessionRepository.findById(sessionId)
    if (!session) {
      throw new Error('Focus session not found')
    }

    if (session.userId !== userId) {
      throw new Error('Unauthorized: session does not belong to user')
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active')
    }

    // Calculate duration in seconds
    const endTime = new Date()
    const durationSeconds = Math.floor(
      (endTime.getTime() - session.startTime.getTime()) / 1000
    )
    const durationMinutes = Math.ceil(durationSeconds / 60)

    // Calculate XP reward
    // Base: 1 XP per minute
    let xpReward = durationMinutes

    // Streak bonus: +10% per day streak (max 50% at 5+ days)
    if (streakDays > 0) {
      const streakBonus = Math.min(streakDays * 0.1, 0.5) // Cap at 50%
      xpReward = Math.floor(xpReward * (1 + streakBonus))
    }

    // Minimum 5 XP for any completed session
    xpReward = Math.max(xpReward, 5)

    // End the session in database
    const completedSession = await focusSessionRepository.endSession(
      sessionId,
      durationSeconds,
      xpReward
    )

    // Award XP to user
    await userRepository.updateXP(userId, xpReward)

    return {
      session: completedSession,
      xpAwarded: xpReward,
    }
  }

  /**
   * Abandon a focus session (no XP awarded)
   */
  async abandonSession(sessionId: string, userId: string): Promise<FocusSession> {
    const session = await focusSessionRepository.findById(sessionId)
    if (!session) {
      throw new Error('Focus session not found')
    }

    if (session.userId !== userId) {
      throw new Error('Unauthorized: session does not belong to user')
    }

    return focusSessionRepository.abandonSession(sessionId)
  }

  /**
   * Get user's focus sessions
   */
  async getUserSessions(userId: string): Promise<FocusSession[]> {
    return focusSessionRepository.getUserSessions(userId)
  }

  /**
   * Get user's active session (if any)
   */
  async getUserActiveSession(userId: string): Promise<FocusSession | null> {
    const sessions = await focusSessionRepository.getUserSessions(userId)
    return sessions.find((s) => s.status === 'active') || null
  }

  /**
   * Get user's total focus time (in minutes)
   */
  async getUserTotalFocusTime(userId: string): Promise<number> {
    const sessions = await focusSessionRepository.getUserSessions(userId)
    return sessions.reduce((total, session) => {
      if (session.duration) {
        return total + Math.floor(session.duration / 60)
      }
      return total
    }, 0)
  }

  /**
   * Get user's total XP from focus sessions
   */
  async getUserFocusSessionXP(userId: string): Promise<number> {
    const sessions = await focusSessionRepository.getUserSessions(userId)
    return sessions.reduce((total, session) => {
      return total + (session.xpReward || 0)
    }, 0)
  }

  /**
   * Calculate XP reward for a given duration and streak
   * Used for preview before session ends
   */
  calculateXPReward(durationMinutes: number, streakDays: number = 0): number {
    let xpReward = durationMinutes

    if (streakDays > 0) {
      const streakBonus = Math.min(streakDays * 0.1, 0.5)
      xpReward = Math.floor(xpReward * (1 + streakBonus))
    }

    return Math.max(xpReward, 5)
  }
}

export default new FocusSessionService()
