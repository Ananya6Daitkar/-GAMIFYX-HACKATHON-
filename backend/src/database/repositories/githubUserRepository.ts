import pool from '../connection'
import { GitHubUser } from '../models'

export class GitHubUserRepository {
  async findByUserId(userId: string): Promise<GitHubUser | null> {
    const result = await pool.query(
      'SELECT * FROM github_users WHERE user_id = $1',
      [userId]
    )
    return result.rows[0] || null
  }

  async findByGithubUsername(githubUsername: string): Promise<GitHubUser | null> {
    const result = await pool.query(
      'SELECT * FROM github_users WHERE github_username = $1',
      [githubUsername]
    )
    return result.rows[0] || null
  }

  async findByGithubId(githubId: number): Promise<GitHubUser | null> {
    const result = await pool.query(
      'SELECT * FROM github_users WHERE github_id = $1',
      [githubId]
    )
    return result.rows[0] || null
  }

  async create(githubUser: Omit<GitHubUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<GitHubUser> {
    const result = await pool.query(
      `INSERT INTO github_users (user_id, github_username, github_id, github_token, github_refresh_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        githubUser.userId,
        githubUser.githubUsername,
        githubUser.githubId,
        githubUser.githubToken,
        githubUser.githubRefreshToken || null,
        githubUser.tokenExpiresAt || null,
      ]
    )
    return result.rows[0]
  }

  async updateToken(userId: string, token: string, refreshToken?: string, expiresAt?: Date): Promise<GitHubUser> {
    const result = await pool.query(
      `UPDATE github_users 
       SET github_token = $1, github_refresh_token = $2, token_expires_at = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING *`,
      [token, refreshToken || null, expiresAt || null, userId]
    )
    return result.rows[0]
  }

  async delete(userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM github_users WHERE user_id = $1',
      [userId]
    )
    return (result.rowCount ?? 0) > 0
  }
}

export default new GitHubUserRepository()
