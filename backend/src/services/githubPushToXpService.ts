import { User, AssignmentSubmission } from '../database/models'
import userRepository from '../database/repositories/userRepository'
import badgeRepository from '../database/repositories/badgeRepository'
import leaderboardRepository from '../database/repositories/leaderboardRepository'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'
import { io } from '../server'

interface PushToXpResult {
  xpEarned: number
  leveledUp: boolean
  newLevel: number
  badgesUnlocked: string[]
  user: User
}

export class GitHubPushToXpService {
  /**
   * Process a GitHub push and award XP
   * Called after a submission is graded
   */
  async processPushAndAwardXP(
    studentId: string,
    submissionId: string,
    baseXpReward: number
  ): Promise<PushToXpResult> {
    // Get current user
    const user = await userRepository.findById(studentId)
    if (!user) {
      throw new Error('User not found')
    }

    // Award base XP (2 XP per commit, already calculated in baseXpReward)
    const updatedUser = await userRepository.updateXP(studentId, baseXpReward)

    // Check if user leveled up
    const oldLevel = user.level
    const newLevel = this.calculateLevel(updatedUser.totalXp)
    const leveledUp = newLevel > oldLevel

    if (leveledUp) {
      await userRepository.updateLevel(studentId, newLevel)
    }

    // Check and unlock badges
    const badgesUnlocked = await this.checkAndUnlockBadges(studentId, submissionId, updatedUser)

    // Invalidate leaderboard cache to reflect new XP
    await leaderboardRepository.invalidateCache()

    // Broadcast real-time updates via WebSocket
    await this.broadcastXpUpdate(studentId, baseXpReward, newLevel, leveledUp, badgesUnlocked)

    return {
      xpEarned: baseXpReward,
      leveledUp,
      newLevel,
      badgesUnlocked,
      user: updatedUser,
    }
  }

  /**
   * Calculate level based on total XP
   * Level = floor(totalXP / 100)
   */
  private calculateLevel(totalXp: number): number {
    return Math.floor(totalXp / 100)
  }

  /**
   * Check and unlock badges based on criteria
   */
  private async checkAndUnlockBadges(
    studentId: string,
    submissionId: string,
    user: User
  ): Promise<string[]> {
    const badgesUnlocked: string[] = []

    // Get all badges
    const allBadges = await badgeRepository.getAll()

    for (const badge of allBadges) {
      // Check if user already has this badge
      const hasBadge = await badgeRepository.hasBadge(studentId, badge.id)
      if (hasBadge) continue

      // Check badge criteria
      const shouldUnlock = await this.checkBadgeCriteria(badge.name, studentId, submissionId, user)

      if (shouldUnlock) {
        await badgeRepository.earnBadge(studentId, badge.id)
        badgesUnlocked.push(badge.name)
      }
    }

    return badgesUnlocked
  }

  /**
   * Check if a badge should be unlocked based on its criteria
   */
  private async checkBadgeCriteria(
    badgeName: string,
    studentId: string,
    submissionId: string,
    user: User
  ): Promise<boolean> {
    switch (badgeName) {
      case 'First Commit':
        return await this.checkFirstCommit(studentId)

      case 'Commit Streak':
        return await this.checkCommitStreak(studentId)

      case 'Code Master':
        return await this.checkCodeMaster(submissionId)

      case 'Feedback Listener':
        return await this.checkFeedbackListener(studentId)

      default:
        return false
    }
  }

  /**
   * Check if this is the user's first commit
   */
  private async checkFirstCommit(studentId: string): Promise<boolean> {
    const submissions = await assignmentSubmissionRepository.findByStudentId(studentId)
    // If this is the first submission with PASS status, unlock badge
    const passedSubmissions = submissions.filter((s) => s.status === 'PASS')
    return passedSubmissions.length === 1
  }

  /**
   * Check if user has 5+ commits in 7 days
   */
  private async checkCommitStreak(studentId: string): Promise<boolean> {
    const submissions = await assignmentSubmissionRepository.findByStudentId(studentId)

    // Get submissions from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentSubmissions = submissions.filter((s) => new Date(s.createdAt) >= sevenDaysAgo)

    return recentSubmissions.length >= 5
  }

  /**
   * Check if submission has PASS status
   */
  private async checkCodeMaster(submissionId: string): Promise<boolean> {
    const submission = await assignmentSubmissionRepository.findById(submissionId)
    return submission?.status === 'PASS' || false
  }

  /**
   * Check if user has implemented AI suggestions
   * This is a placeholder - in a real system, you'd track if user made changes based on feedback
   */
  private async checkFeedbackListener(studentId: string): Promise<boolean> {
    // For now, unlock after 3 submissions with feedback
    const submissions = await assignmentSubmissionRepository.findByStudentId(studentId)
    return submissions.length >= 3
  }

  /**
   * Broadcast XP update to all connected clients via WebSocket
   */
  private async broadcastXpUpdate(
    studentId: string,
    xpEarned: number,
    newLevel: number,
    leveledUp: boolean,
    badgesUnlocked: string[]
  ): Promise<void> {
    // Broadcast to all connected clients
    io.emit('xp-earned', {
      studentId,
      xpEarned,
      newLevel,
      leveledUp,
      badgesUnlocked,
      timestamp: new Date(),
    })

    // Also emit to specific student's room if they're connected
    io.to(`user:${studentId}`).emit('personal-xp-update', {
      xpEarned,
      newLevel,
      leveledUp,
      badgesUnlocked,
      timestamp: new Date(),
    })

    // Broadcast leaderboard update
    io.emit('leaderboard-update', {
      studentId,
      timestamp: new Date(),
    })
  }

  /**
   * Get user's current streak (consecutive days of activity)
   */
  async getUserStreak(studentId: string): Promise<number> {
    const submissions = await assignmentSubmissionRepository.findByStudentId(studentId)

    if (submissions.length === 0) return 0

    // Get unique dates with submissions
    const uniqueDates = new Set<string>()
    submissions.forEach((submission) => {
      const dateStr = new Date(submission.createdAt).toISOString().split('T')[0]
      uniqueDates.add(dateStr)
    })

    // Sort dates in descending order
    const sortedDates = Array.from(uniqueDates).sort().reverse()

    // Calculate streak from today backwards
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const dateStr of sortedDates) {
      const submissionDate = new Date(dateStr)
      submissionDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor(
        (currentDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  /**
   * Get user's analytics data for activity chart
   */
  async getUserActivityData(studentId: string, days: number = 30): Promise<any[]> {
    const submissions = await assignmentSubmissionRepository.findByStudentId(studentId)

    // Create a map of dates to submission counts
    const activityMap = new Map<string, number>()

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      activityMap.set(dateStr, 0)
    }

    // Count submissions per day
    submissions.forEach((submission) => {
      const dateStr = new Date(submission.createdAt).toISOString().split('T')[0]
      if (activityMap.has(dateStr)) {
        activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1)
      }
    })

    // Convert to array and sort by date
    return Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, submissionCount: count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}

export default new GitHubPushToXpService()
