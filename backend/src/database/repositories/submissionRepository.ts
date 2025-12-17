import pool from '../connection'
import { Submission } from '../models'

export class SubmissionRepository {
  async findById(id: string): Promise<Submission | null> {
    const result = await pool.query(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  async findByStudentId(studentId: string): Promise<Submission[]> {
    const result = await pool.query(
      'SELECT * FROM submissions WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    )
    return result.rows
  }

  async create(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission> {
    const result = await pool.query(
      `INSERT INTO submissions (student_id, code, language, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [submission.studentId, submission.code, submission.language, submission.status]
    )
    return result.rows[0]
  }

  async updateStatus(
    submissionId: string,
    status: 'pending' | 'approved' | 'revision_needed'
  ): Promise<Submission> {
    const result = await pool.query(
      `UPDATE submissions SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, submissionId]
    )
    return result.rows[0]
  }

  async updateFeedback(submissionId: string, feedbackId: string): Promise<Submission> {
    const result = await pool.query(
      `UPDATE submissions SET feedback_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [feedbackId, submissionId]
    )
    return result.rows[0]
  }

  async getByStatus(status: string): Promise<Submission[]> {
    const result = await pool.query(
      'SELECT * FROM submissions WHERE status = $1 ORDER BY created_at DESC',
      [status]
    )
    return result.rows
  }

  async getAll(): Promise<Submission[]> {
    const result = await pool.query(
      'SELECT * FROM submissions ORDER BY created_at DESC'
    )
    return result.rows
  }
}

export default new SubmissionRepository()
