import pool from '../connection'
import { AIFeedback } from '../models'

export class AIFeedbackRepository {
  async findById(id: string): Promise<AIFeedback | null> {
    const result = await pool.query(
      'SELECT * FROM ai_feedback WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  async findBySubmissionId(submissionId: string): Promise<AIFeedback | null> {
    const result = await pool.query(
      'SELECT * FROM ai_feedback WHERE submission_id = $1',
      [submissionId]
    )
    return result.rows[0] || null
  }

  async create(feedback: Omit<AIFeedback, 'id' | 'generatedAt'>): Promise<AIFeedback> {
    const result = await pool.query(
      `INSERT INTO ai_feedback (submission_id, insights, confidence_score, code_references)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        feedback.submissionId,
        feedback.insights,
        feedback.confidenceScore,
        JSON.stringify(feedback.codeReferences),
      ]
    )
    return result.rows[0]
  }

  async getBySubmissionId(submissionId: string): Promise<AIFeedback | null> {
    const result = await pool.query(
      'SELECT * FROM ai_feedback WHERE submission_id = $1',
      [submissionId]
    )
    return result.rows[0] || null
  }

  async getAll(): Promise<AIFeedback[]> {
    const result = await pool.query(
      'SELECT * FROM ai_feedback ORDER BY generated_at DESC'
    )
    return result.rows
  }
}

export default new AIFeedbackRepository()
