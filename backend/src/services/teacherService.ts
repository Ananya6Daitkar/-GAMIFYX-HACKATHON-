import pool from '../database/connection'

export class TeacherService {
  /**
   * Get class overview with total students, average XP, and class leaderboard
   * Requirements: 9.1
   */
  async getClassOverview(_teacherId: string) {
    try {
      // Get all students (assuming teacher has access to all students for now)
      const studentsResult = await pool.query(
        `SELECT id, username, email, level, total_xp, avatar, created_at 
         FROM users 
         WHERE role = 'student' 
         ORDER BY total_xp DESC`
      )

      const students = studentsResult.rows

      // Calculate class statistics
      const totalStudents = students.length
      const averageXp = students.length > 0
        ? Math.round(students.reduce((sum: number, s: any) => sum + s.total_xp, 0) / students.length)
        : 0

      // Get top 10 students for class leaderboard
      const classLeaderboard = students.slice(0, 10).map((student: any, index: number) => ({
        rank: index + 1,
        userId: student.id,
        username: student.username,
        xp: student.total_xp,
        level: student.level,
        avatar: student.avatar,
      }))

      return {
        totalStudents,
        averageXp,
        classLeaderboard,
      }
    } catch (error) {
      console.error('Error getting class overview:', error)
      throw error
    }
  }

  /**
   * Get student list with progress bars and intervention indicators
   * Requirements: 9.2, 9.3
   */
  async getStudentList(_teacherId: string) {
    try {
      const result = await pool.query(
        `SELECT id, username, email, level, total_xp, avatar, created_at 
         FROM users 
         WHERE role = 'student' 
         ORDER BY total_xp DESC`
      )

      const students = result.rows

      // Calculate class average for intervention indicator
      const averageXp = students.length > 0
        ? students.reduce((sum: number, s: any) => sum + s.total_xp, 0) / students.length
        : 0

      // Calculate 10th percentile for intervention threshold
      const sortedXp = students.map((s: any) => s.total_xp).sort((a: number, b: number) => a - b)
      const tenthPercentileIndex = Math.floor(students.length * 0.1)
      const interventionThreshold = sortedXp[tenthPercentileIndex] || 0

      // Map students with intervention indicators
      const studentList = students.map((student: any) => ({
        id: student.id,
        username: student.username,
        email: student.email,
        level: student.level,
        totalXp: student.total_xp,
        avatar: student.avatar,
        progressPercentage: Math.min(100, Math.round((student.total_xp / (averageXp * 2)) * 100)),
        needsIntervention: student.total_xp < interventionThreshold,
        interventionReason: student.total_xp < interventionThreshold
          ? `Low engagement: ${student.total_xp} XP (below 10th percentile)`
          : null,
      }))

      return studentList
    } catch (error) {
      console.error('Error getting student list:', error)
      throw error
    }
  }

  /**
   * Get detailed student view with analytics and submission history
   * Requirements: 9.4
   */
  async getStudentDetail(studentId: string) {
    try {
      // Get student profile
      const userResult = await pool.query(
        `SELECT id, username, email, level, total_xp, avatar, created_at 
         FROM users 
         WHERE id = $1 AND role = 'student'`,
        [studentId]
      )

      if (userResult.rows.length === 0) {
        throw new Error('Student not found')
      }

      const student = userResult.rows[0]

      // Get submission history
      const submissionsResult = await pool.query(
        `SELECT id, code, language, status, created_at, updated_at 
         FROM submissions 
         WHERE student_id = $1 
         ORDER BY created_at DESC`,
        [studentId]
      )

      // Get analytics data
      const analyticsResult = await pool.query(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as submission_count,
           language
         FROM submissions 
         WHERE student_id = $1 
         GROUP BY DATE(created_at), language
         ORDER BY date DESC`,
        [studentId]
      )

      // Calculate skill distribution
      const skillResult = await pool.query(
        `SELECT language, COUNT(*) as count 
         FROM submissions 
         WHERE student_id = $1 
         GROUP BY language`,
        [studentId]
      )

      const skillDistribution = skillResult.rows.map((row: any) => ({
        language: row.language,
        proficiency: Math.min(100, row.count * 10), // Simple proficiency calculation
      }))

      return {
        student: {
          id: student.id,
          username: student.username,
          email: student.email,
          level: student.level,
          totalXp: student.total_xp,
          avatar: student.avatar,
          memberSince: student.created_at,
        },
        submissions: submissionsResult.rows,
        analytics: {
          activityTimeline: analyticsResult.rows,
          skillDistribution,
        },
      }
    } catch (error) {
      console.error('Error getting student detail:', error)
      throw error
    }
  }

  /**
   * Review submission - approve, request revision, or provide feedback
   * Requirements: 9.5
   */
  async reviewSubmission(
    submissionId: string,
    status: 'approved' | 'revision_needed',
    feedback?: string
  ) {
    try {
      // Update submission status
      const result = await pool.query(
        `UPDATE submissions 
         SET status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [status, submissionId]
      )

      if (result.rows.length === 0) {
        throw new Error('Submission not found')
      }

      // If feedback is provided, store it (this would typically go to a feedback table)
      if (feedback) {
        // TODO: Store feedback in a teacher_feedback table
        console.log(`Feedback for submission ${submissionId}: ${feedback}`)
      }

      return result.rows[0]
    } catch (error) {
      console.error('Error reviewing submission:', error)
      throw error
    }
  }

  /**
   * Get assignment submissions for a teacher
   * Requirements: 9.5
   */
  async getAssignmentSubmissions(assignmentId: string) {
    try {
      const result = await pool.query(
        `SELECT 
           asub.id,
           asub.assignment_id,
           asub.student_id,
           asub.status,
           asub.auto_grade_score,
           asub.xp_earned,
           asub.created_at,
           asub.updated_at,
           u.username,
           u.avatar
         FROM assignment_submissions asub
         JOIN users u ON asub.student_id = u.id
         WHERE asub.assignment_id = $1
         ORDER BY asub.created_at DESC`,
        [assignmentId]
      )

      return result.rows
    } catch (error) {
      console.error('Error getting assignment submissions:', error)
      throw error
    }
  }

  /**
   * Update assignment submission status and feedback
   * Requirements: 9.5
   */
  async updateAssignmentSubmission(
    submissionId: string,
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'PASS' | 'REVIEW' | 'FAIL',
    feedback?: string
  ) {
    try {
      const result = await pool.query(
        `UPDATE assignment_submissions 
         SET status = $1, teacher_feedback = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [status, submissionId, feedback || null]
      )

      if (result.rows.length === 0) {
        throw new Error('Assignment submission not found')
      }

      return result.rows[0]
    } catch (error) {
      console.error('Error updating assignment submission:', error)
      throw error
    }
  }
}

export default new TeacherService()
