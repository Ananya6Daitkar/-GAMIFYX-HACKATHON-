import pool from '../connection'
import { AssignmentSubmission } from '../models'

export class AssignmentSubmissionRepository {
  async findById(id: string): Promise<AssignmentSubmission | null> {
    const result = await pool.query(
      'SELECT * FROM assignment_submissions WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  async findByAssignmentId(assignmentId: string): Promise<AssignmentSubmission[]> {
    const result = await pool.query(
      'SELECT * FROM assignment_submissions WHERE assignment_id = $1 ORDER BY created_at DESC',
      [assignmentId]
    )
    return result.rows
  }

  async findByStudentId(studentId: string): Promise<AssignmentSubmission[]> {
    const result = await pool.query(
      'SELECT * FROM assignment_submissions WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    )
    return result.rows
  }

  async findByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
    const result = await pool.query(
      'SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignmentId, studentId]
    )
    return result.rows[0] || null
  }

  async create(submission: Omit<AssignmentSubmission, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentSubmission> {
    const result = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, status, github_repo_url, github_branch, auto_grade_score, xp_earned)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        submission.assignmentId,
        submission.studentId,
        submission.status,
        submission.githubRepoUrl,
        submission.githubBranch,
        submission.autoGradeScore || null,
        submission.xpEarned,
      ]
    )
    return result.rows[0]
  }

  async updateStatus(id: string, status: AssignmentSubmission['status']): Promise<AssignmentSubmission> {
    const result = await pool.query(
      `UPDATE assignment_submissions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    )
    return result.rows[0]
  }

  async updateGradeAndXP(id: string, score: number, xpEarned: number): Promise<AssignmentSubmission> {
    const result = await pool.query(
      `UPDATE assignment_submissions SET auto_grade_score = $1, xp_earned = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [score, xpEarned, id]
    )
    return result.rows[0]
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM assignment_submissions WHERE id = $1',
      [id]
    )
    return (result.rowCount ?? 0) > 0
  }
}

export default new AssignmentSubmissionRepository()
