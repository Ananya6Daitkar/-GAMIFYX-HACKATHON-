import express, { Request, Response } from 'express'
import feedbackService from '../services/feedbackService'
import { authMiddleware } from '../middleware/auth'
import realtimeService from '../services/realtimeService'

const router = express.Router()

/**
 * POST /api/feedback
 * Create a new feedback/contact form submission
 * Body: { category, subject, message, attachments? }
 * Requirement 16.3
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { category, subject, message, attachments } = req.body

    // Validate required fields
    if (!category || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields: category, subject, message',
      })
    }

    // Create feedback
    const { feedback, ticketNumber } = await feedbackService.createFeedback(userId, {
      category,
      subject,
      message,
      attachments,
    })

    // Send notification to assigned mentor if applicable
    if (feedback.assignedTo) {
      await feedbackService.notifyAssignedMentor(feedback, ticketNumber)

      // Broadcast feedback notification to assigned mentor via WebSocket
      // Property 7: Feedback Routing Correctness
      realtimeService.notifyUser(feedback.assignedTo, 'feedback:assigned', `New feedback assigned to you: ${ticketNumber}`, {
        feedbackId: feedback.id,
        ticketNumber,
        category,
        subject,
      })
    }

    res.status(201).json({
      success: true,
      feedback,
      ticketNumber,
      message: `Feedback submitted successfully. Your ticket number is: ${ticketNumber}`,
    })
  } catch (error: any) {
    console.error('Error creating feedback:', error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /api/feedback/:id
 * Get feedback by ID
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId

    const feedback = await feedbackService.getFeedbackById(id)
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' })
    }

    // Check authorization: user can view their own feedback or if they're assigned to it
    if (feedback.userId !== userId && feedback.assignedTo !== userId) {
      // Check if user is admin
      const user = await require('../database/repositories/userRepository').default.findById(userId)
      if (user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' })
      }
    }

    res.json(feedback)
  } catch (error: any) {
    console.error('Error fetching feedback:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/feedback/user/my-feedback
 * Get all feedback for the current user
 */
router.get('/user/my-feedback', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const feedback = await feedbackService.getUserFeedback(userId)
    res.json(feedback)
  } catch (error: any) {
    console.error('Error fetching user feedback:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/feedback/assigned/to-me
 * Get all feedback assigned to the current user (mentor/teacher)
 */
router.get('/assigned/to-me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    // Verify user is a mentor/teacher
    const user = await require('../database/repositories/userRepository').default.findById(userId)
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers and admins can view assigned feedback' })
    }

    const feedback = await feedbackService.getAssignedFeedback(userId)
    res.json(feedback)
  } catch (error: any) {
    console.error('Error fetching assigned feedback:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/feedback/:id/status
 * Update feedback status
 * Body: { status: 'open' | 'in_progress' | 'resolved' }
 * Requirement 16.3
 */
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = (req as any).userId

    // Validate status
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    // Get feedback to check authorization
    const feedback = await feedbackService.getFeedbackById(id)
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' })
    }

    // Check authorization: assigned mentor or admin
    const user = await require('../database/repositories/userRepository').default.findById(userId)
    if (feedback.assignedTo !== userId && user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const updated = await feedbackService.updateFeedbackStatus(id, status, userId)

    // Notify the feedback submitter of status change
    realtimeService.notifyUser(feedback.userId, 'feedback:statusChanged', `Your feedback status has been updated to: ${status}`, {
      feedbackId: id,
      status,
    })

    res.json(updated)
  } catch (error: any) {
    console.error('Error updating feedback status:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/feedback/:id/assign
 * Assign feedback to a mentor/teacher (admin only)
 * Body: { assignedTo: userId }
 */
router.patch('/:id/assign', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { assignedTo } = req.body
    const userId = (req as any).userId

    // Verify user is admin
    const user = await require('../database/repositories/userRepository').default.findById(userId)
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can assign feedback' })
    }

    if (!assignedTo) {
      return res.status(400).json({ error: 'assignedTo is required' })
    }

    const updated = await feedbackService.assignFeedback(id, assignedTo, userId)
    res.json(updated)
  } catch (error: any) {
    console.error('Error assigning feedback:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/feedback
 * Get all feedback (admin only)
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { status } = req.query

    // Verify user is admin
    const user = await require('../database/repositories/userRepository').default.findById(userId)
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all feedback' })
    }

    let feedback
    if (status) {
      feedback = await feedbackService.getFeedbackByStatus(status as string)
    } else {
      feedback = await feedbackService.getAllFeedback()
    }

    res.json(feedback)
  } catch (error: any) {
    console.error('Error fetching all feedback:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
