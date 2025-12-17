import pool from '../connection'
import type { LeaderboardEntry } from '../models'
import { cacheLeaderboard, getLeaderboardFromCache } from '../redis'

export class LeaderboardRepository {
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<LeaderboardEntry[]> {
    // Try to get from cache first
    const cached = await getLeaderboardFromCache(period)
    if (cached) {
      return cached
    }

    // Calculate date range based on period (for future use)
    // Currently using simple XP-based ranking regardless of period
    switch (period) {
      case 'daily':
      case 'weekly':
      case 'monthly':
        // All periods use same ranking for now
        break
    }

    // Query leaderboard from database
    const result = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank,
        u.id as user_id,
        u.username,
        u.total_xp as xp,
        COALESCE(
          (SELECT COUNT(DISTINCT DATE(created_at)) 
           FROM submissions 
           WHERE student_id = u.id 
           AND created_at >= CURRENT_DATE - INTERVAL '1 day'),
          0
        ) as streak
       FROM users u
       WHERE u.role = 'student'
       ORDER BY u.total_xp DESC
       LIMIT 100`
    )

    const entries: LeaderboardEntry[] = result.rows.map((row) => ({
      rank: row.rank,
      userId: row.user_id,
      username: row.username,
      xp: row.xp,
      streak: row.streak,
    }))

    // Cache the results
    await cacheLeaderboard(period, entries)

    return entries
  }

  async getTopN(period: 'daily' | 'weekly' | 'monthly', n: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboard = await this.getLeaderboard(period)
    return leaderboard.slice(0, n)
  }

  async getUserRank(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<number | null> {
    const leaderboard = await this.getLeaderboard(period)
    const entry = leaderboard.find((e) => e.userId === userId)
    return entry?.rank || null
  }

  async invalidateCache(): Promise<void> {
    const { invalidateLeaderboardCache } = await import('../redis')
    await invalidateLeaderboardCache()
  }
}

export default new LeaderboardRepository()
