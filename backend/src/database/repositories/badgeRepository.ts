import pool from '../connection'
import { Badge, UserBadge } from '../models'

export class BadgeRepository {
  async findById(id: string): Promise<Badge | null> {
    const result = await pool.query('SELECT * FROM badges WHERE id = $1', [id])
    return result.rows[0] || null
  }

  async create(badge: Omit<Badge, 'id' | 'createdAt'>): Promise<Badge> {
    const result = await pool.query(
      `INSERT INTO badges (name, description, criteria, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [badge.name, badge.description, badge.criteria, badge.icon]
    )
    return result.rows[0]
  }

  async getAll(): Promise<Badge[]> {
    const result = await pool.query('SELECT * FROM badges ORDER BY created_at DESC')
    return result.rows
  }

  async earnBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const result = await pool.query(
      `INSERT INTO user_badges (user_id, badge_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, badge_id) DO UPDATE SET earned_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, badgeId]
    )
    return result.rows[0]
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    const result = await pool.query(
      `SELECT b.* FROM badges b
       INNER JOIN user_badges ub ON b.id = ub.badge_id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    )
    return result.rows
  }

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM user_badges WHERE user_id = $1 AND badge_id = $2`,
      [userId, badgeId]
    )
    return result.rows.length > 0
  }

  async getBadgeEarnedAt(userId: string, badgeId: string): Promise<Date | null> {
    const result = await pool.query(
      `SELECT earned_at FROM user_badges WHERE user_id = $1 AND badge_id = $2`,
      [userId, badgeId]
    )
    return result.rows[0]?.earned_at || null
  }
}

export default new BadgeRepository()
