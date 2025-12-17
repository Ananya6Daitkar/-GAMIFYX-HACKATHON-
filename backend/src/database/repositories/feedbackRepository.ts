import pool from '../connection'
import { Feedback, AuditEntry } from '../models'

export class FeedbackRepository {
  async findById(id: string): Promise<Feedback | null> {
    const result = await pool.query(
      'SELECT * FROM feedback WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  async create(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>): Promise<Feedback> {
    const auditTrail: AuditEntry[] = [
      {
        timestamp: new Date(),
        action: 'created',
        actor: feedback.userId,
        details: `Feedback created with category: ${feedback.category}`,
      },
    ]

    const result = await pool.query(
      `INSERT INTO feedback (user_id, category, subject, message, attachments, status, audit_trail)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        feedback.userId,
        feedback.category,
        feedback.subject,
        feedback.message,
        feedback.attachments || [],
        feedback.status,
        JSON.stringify(auditTrail),
      ]
    )
    return result.rows[0]
  }

  async updateStatus(feedbackId: string, status: string, actor: string): Promise<Feedback> {
    const feedback = await this.findById(feedbackId)
    if (!feedback) throw new Error('Feedback not found')

    const auditTrail = feedback.auditTrail || []
    auditTrail.push({
      timestamp: new Date(),
      action: `status_changed_to_${status}`,
      actor,
      details: `Status changed to ${status}`,
    })

    const result = await pool.query(
      `UPDATE feedback SET status = $1, audit_trail = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, JSON.stringify(auditTrail), feedbackId]
    )
    return result.rows[0]
  }

  async assignTo(feedbackId: string, assignedTo: string, actor: string): Promise<Feedback> {
    const feedback = await this.findById(feedbackId)
    if (!feedback) throw new Error('Feedback not found')

    const auditTrail = feedback.auditTrail || []
    auditTrail.push({
      timestamp: new Date(),
      action: 'assigned',
      actor,
      details: `Assigned to ${assignedTo}`,
    })

    const result = await pool.query(
      `UPDATE feedback SET assigned_to = $1, audit_trail = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [assignedTo, JSON.stringify(auditTrail), feedbackId]
    )
    return result.rows[0]
  }

  async getByStatus(status: string): Promise<Feedback[]> {
    const result = await pool.query(
      'SELECT * FROM feedback WHERE status = $1 ORDER BY created_at DESC',
      [status]
    )
    return result.rows
  }

  async getByUserId(userId: string): Promise<Feedback[]> {
    const result = await pool.query(
      'SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    return result.rows
  }

  async getAssignedTo(userId: string): Promise<Feedback[]> {
    const result = await pool.query(
      'SELECT * FROM feedback WHERE assigned_to = $1 ORDER BY created_at DESC',
      [userId]
    )
    return result.rows
  }

  async getAll(): Promise<Feedback[]> {
    const result = await pool.query(
      'SELECT * FROM feedback ORDER BY created_at DESC'
    )
    return result.rows
  }
}

export default new FeedbackRepository()
