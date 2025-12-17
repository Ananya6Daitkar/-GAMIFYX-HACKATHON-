import { Assignment, AssignmentSubmission } from '../database/models'
import assignmentRepository from '../database/repositories/assignmentRepository'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'
import userRepository from '../database/repositories/userRepository'

export class AssignmentService {
  /**
   * Create a new assignment (teachers only)
   */
  async createAssignment(
    teacherId: string,
    data: {
      title: string
      description: string
      difficulty: 'EASY' | 'MEDIUM' | 'HARD'
      xpReward: number
      requiredFiles: string[]
      expectedFolderStructure?: string
      deadline: Date
    }
  ): Promise<Assignment> {
    // Verify teacher role
    const teacher = await userRepository.findById(teacherId)
    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Only teachers can create assignments')
    }

    return assignmentRepository.create({
      teacherId,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      xpReward: data.xpReward,
      requiredFiles: data.requiredFiles,
      expectedFolderStructure: data.expectedFolderStructure,
      deadline: data.deadline,
    })
  }

  /**
   * Update an assignment (teachers only)
   */
  async updateAssignment(
    assignmentId: string,
    teacherId: string,
    updates: Partial<Assignment>
  ): Promise<Assignment> {
    const assignment = await assignmentRepository.findById(assignmentId)
    if (!assignment) {
      throw new Error('Assignment not found')
    }

    if (assignment.teacherId !== teacherId) {
      throw new Error('Only the assignment creator can update it')
    }

    return assignmentRepository.update(assignmentId, updates)
  }

  /**
   * Delete an assignment (teachers only)
   */
  async deleteAssignment(assignmentId: string, teacherId: string): Promise<boolean> {
    const assignment = await assignmentRepository.findById(assignmentId)
    if (!assignment) {
      throw new Error('Assignment not found')
    }

    if (assignment.teacherId !== teacherId) {
      throw new Error('Only the assignment creator can delete it')
    }

    return assignmentRepository.delete(assignmentId)
  }

  /**
   * Get all assignments for a teacher
   */
  async getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
    return assignmentRepository.findByTeacherId(teacherId)
  }

  /**
   * Get all available assignments (for students)
   */
  async getAllAssignments(): Promise<Assignment[]> {
    return assignmentRepository.findAll()
  }

  /**
   * Get a single assignment by ID
   */
  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    return assignmentRepository.findById(assignmentId)
  }

  /**
   * Student accepts an assignment
   */
  async acceptAssignment(
    assignmentId: string,
    studentId: string,
    githubRepoUrl: string,
    githubBranch: string = 'main'
  ): Promise<AssignmentSubmission> {
    // Verify assignment exists
    const assignment = await assignmentRepository.findById(assignmentId)
    if (!assignment) {
      throw new Error('Assignment not found')
    }

    // Check if student already has a submission for this assignment
    const existingSubmission = await assignmentSubmissionRepository.findByAssignmentAndStudent(
      assignmentId,
      studentId
    )

    if (existingSubmission) {
      throw new Error('Student has already accepted this assignment')
    }

    // Create assignment submission
    return assignmentSubmissionRepository.create({
      assignmentId,
      studentId,
      status: 'IN_PROGRESS',
      githubRepoUrl,
      githubBranch,
      xpEarned: 0,
    })
  }

  /**
   * Get student's assignment submissions
   */
  async getStudentSubmissions(studentId: string): Promise<AssignmentSubmission[]> {
    return assignmentSubmissionRepository.findByStudentId(studentId)
  }

  /**
   * Get submissions for an assignment
   */
  async getAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return assignmentSubmissionRepository.findByAssignmentId(assignmentId)
  }

  /**
   * Get a specific submission
   */
  async getSubmissionById(submissionId: string): Promise<AssignmentSubmission | null> {
    return assignmentSubmissionRepository.findById(submissionId)
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string,
    status: AssignmentSubmission['status']
  ): Promise<AssignmentSubmission> {
    return assignmentSubmissionRepository.updateStatus(submissionId, status)
  }

  /**
   * Update submission grade and XP
   */
  async updateSubmissionGradeAndXP(
    submissionId: string,
    score: number,
    xpEarned: number
  ): Promise<AssignmentSubmission> {
    return assignmentSubmissionRepository.updateGradeAndXP(submissionId, score, xpEarned)
  }

  /**
   * Calculate XP reward based on score and difficulty
   */
  calculateXPReward(baseXP: number, score: number, difficulty: 'EASY' | 'MEDIUM' | 'HARD'): number {
    // Difficulty multiplier
    const difficultyMultiplier = {
      EASY: 1.0,
      MEDIUM: 1.1,
      HARD: 1.2,
    }[difficulty]

    // Score-based multiplier (0-100 score)
    const scoreMultiplier = score / 100

    // Calculate final XP
    const finalXP = Math.floor(baseXP * difficultyMultiplier * scoreMultiplier)

    // Minimum 1 XP if score > 0
    return score > 0 ? Math.max(finalXP, 1) : 0
  }
}

export default new AssignmentService()
