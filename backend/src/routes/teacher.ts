import express, { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import teacherService from '../services/teacherService'

const router = Router()

// Middleware to check if user is a teacher
const isTeacher = (req: AuthRequest, res: Response, next: Function) => {
  const userRole = (req as any).userRole
  if (userRole !== 'teacher' && userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Teacher role required.' })
  }
  next()
}

/**
 * Get class overview with total students, average XP, and class leaderboard
 * Requirements: 9.1
 */
router.get('/class-overview', authMiddleware, isTeacher, async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = (req as any).userId
    const overview = await teacherService.getClassOverview(teacherId)
    res.json(overview)
  } catch (error) {
    console.error('Error fetching class overview:', error)
    res.status(500).json({ error: 'Failed to fetch class overview' })
  }
})

/**
 * Get student list with progress bars and intervention indicators
 * Requirements: 9.2, 9.3
 */
router.get('/students', authMiddleware, isTeacher, async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = (req as any).userId
    const students = await teacherService.getStudentList(teacherId)
    res.json(students)
  } catch (error) {
    console.error('Error fetching student list:', error)
    res.status(500).json({ error: 'Failed to fetch student list' })
  }
})

/**
 * Get detailed student view with analytics and submission history
 * Requirements: 9.4
 */
router.get('/students/:studentId', authMiddleware, isTeacher, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params
    const studentDetail = await teacherService.getStudentDetail(studentId)
    res.json(studentDetail)
  } catch (error) {
    console.error('Error fetching student detail:', error)
    res.status(500).json({ error: 'Failed to fetch student detail' })
  }
})

/**
 * Review submission - approve, request revision, or provide feedback
 * Requirements: 9.5
 */
router.put('/submissions/:submissionId/review', authMiddleware, isTeacher, async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params
    const { status, feedback } = req.body

    // Validate status
    if (!['approved', 'revision_needed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "approved" or "revision_needed"' })
    }

    const updatedSubmission = await teacherService.reviewSubmission(submissionId, status, feedback)
    res.json(updatedSubmission)
  } catch (error) {
    console.error('Error reviewing submission:', error)
    res.status(500).json({ error: 'Failed to review submission' })
  }
})

/**
 * Get assignment submissions for a teacher
 * Requirements: 9.5
 */
router.get('/assignments/:assignmentId/submissions', authMiddleware, isTeacher, async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params
    const submissions = await teacherService.getAssignmentSubmissions(assignmentId)
    res.json(submissions)
  } catch (error) {
    console.error('Error fetching assignment submissions:', error)
    res.status(500).json({ error: 'Failed to fetch assignment submissions' })
  }
})

/**
 * Update assignment submission status and feedback
 * Requirements: 9.5
 */
router.put('/assignment-submissions/:submissionId', authMiddleware, isTeacher, async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params
    const { status, feedback } = req.body

    // Validate status
    const validStatuses = ['IN_PROGRESS', 'SUBMITTED', 'PASS', 'REVIEW', 'FAIL']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
    }

    const updatedSubmission = await teacherService.updateAssignmentSubmission(submissionId, status, feedback)
    res.json(updatedSubmission)
  } catch (error) {
    console.error('Error updating assignment submission:', error)
    res.status(500).json({ error: 'Failed to update assignment submission' })
  }
})

export default router
