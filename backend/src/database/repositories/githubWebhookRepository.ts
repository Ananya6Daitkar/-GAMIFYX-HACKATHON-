import pool from '../connection'
import { GitHubWebhook } from '../models'

export class GitHubWebhookRepository {
  async findById(id: string): Promise<GitHubWebhook | null> {
    const result = await pool.query(
      'SELECT * FROM github_webhooks WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  async findBySubmissionId(submissionId: string): Promise<GitHubWebhook | null> {
    const result = await pool.query(
      'SELECT * FROM github_webhooks WHERE assignment_submission_id = $1',
      [submissionId]
    )
    return result.rows[0] || null
  }

  async findByWebhookId(webhookId: number): Promise<GitHubWebhook[]> {
    const result = await pool.query(
      'SELECT * FROM github_webhooks WHERE webhook_id = $1 ORDER BY created_at DESC',
      [webhookId]
    )
    return result.rows
  }

  async create(webhook: Omit<GitHubWebhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<GitHubWebhook> {
    const result = await pool.query(
      `INSERT INTO github_webhooks (assignment_submission_id, webhook_id, repository_name, last_push_sha, last_push_timestamp)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        webhook.assignmentSubmissionId,
        webhook.webhookId,
        webhook.repositoryName,
        webhook.lastPushSha || null,
        webhook.lastPushTimestamp || null,
      ]
    )
    return result.rows[0]
  }

  async updateLastPush(id: string, sha: string, timestamp: Date): Promise<GitHubWebhook> {
    const result = await pool.query(
      `UPDATE github_webhooks SET last_push_sha = $1, last_push_timestamp = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [sha, timestamp, id]
    )
    return result.rows[0]
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM github_webhooks WHERE id = $1',
      [id]
    )
    return (result.rowCount ?? 0) > 0
  }
}

export default new GitHubWebhookRepository()
