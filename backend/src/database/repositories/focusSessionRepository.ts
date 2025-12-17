import pool from '../connection'
import { FocusSession } from '../models'

export class FocusSessionRepository {
  async findById(id: string): Promise<FocusSession | null> {
    const result = await pool.query(
      'SELECT * FROM focus_sessions WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  async create(session: Omit<FocusSession, 'id' | 'createdAt'>): Promise<FocusSession> {
    const result = await pool.query(
      `INSERT INTO focus_sessions (user_id, start_time, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [session.userId, session.startTime, session.status]
    )
    return result.rows[0]
  }

  async endSession(
    sessionId: string,
    duration: number,
    xpReward: number
  ): Promise<FocusSession> {
    const result = await pool.query(
      `UPDATE focus_sessions 
       SET end_time = CURRENT_TIMESTAMP, duration = $1, xp_reward = $2, status = 'completed'
       WHERE id = $3
       RETURNING *`,
      [duration, xpReward, sessionId]
    )
    return result.rows[0]
  }

  async getUserSessions(userId: string): Promise<FocusSession[]> {
    const result = await pool.query(
      'SELECT * FROM focus_sessions WHERE user_id = $1 ORDER BY start_time DESC',
      [userId]
    )
    return result.rows
  }

  async getActiveSessions(): Promise<FocusSession[]> {
    const result = await pool.query(
      "SELECT * FROM focus_sessions WHERE status = 'active' ORDER BY start_time DESC"
    )
    return result.rows
  }

  async abandonSession(sessionId: string): Promise<FocusSession> {
    const result = await pool.query(
      `UPDATE focus_sessions SET status = 'abandoned' WHERE id = $1 RETURNING *`,
      [sessionId]
    )
    return result.rows[0]
  }
}

export default new FocusSessionRepository()
