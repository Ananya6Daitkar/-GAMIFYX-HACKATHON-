import pool from '../connection'
import { User } from '../models'

// Helper to convert database row to User model
const mapRowToUser = (row: any): User => ({
  id: row.id,
  username: row.username,
  email: row.email,
  passwordHash: row.password_hash,
  avatar: row.avatar,
  level: row.level,
  totalXp: row.total_xp,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, avatar, level, total_xp, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user.username,
        user.email,
        user.passwordHash,
        user.avatar || null,
        user.level,
        user.totalXp,
        user.role,
      ]
    )
    return mapRowToUser(result.rows[0])
  }

  async updateXP(userId: string, amount: number): Promise<User> {
    const result = await pool.query(
      `UPDATE users SET total_xp = total_xp + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [amount, userId]
    )
    return mapRowToUser(result.rows[0])
  }

  async updateLevel(userId: string, level: number): Promise<User> {
    const result = await pool.query(
      `UPDATE users SET level = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [level, userId]
    )
    return mapRowToUser(result.rows[0])
  }

  async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.username) {
      fields.push(`username = $${paramCount++}`)
      values.push(updates.username)
    }
    if (updates.email) {
      fields.push(`email = $${paramCount++}`)
      values.push(updates.email)
    }
    if (updates.avatar) {
      fields.push(`avatar = $${paramCount++}`)
      values.push(updates.avatar)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
    return mapRowToUser(result.rows[0])
  }

  async getAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC')
    return result.rows.map(mapRowToUser)
  }
}

export default new UserRepository()
