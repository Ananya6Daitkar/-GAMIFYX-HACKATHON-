import express, { Router, Request, Response } from 'express'
import aiFeedbackService from '../services/aiFeedbackService'
import realtimeService from '../services/realtimeService'

const router = Router()

// Get all submissions for a user
router.get('/user/:userId', (req: Request, res: Response) => {
  // TODO: Implement get user submissions logic
  res.json({ message: 'Get user submissions endpoint' })
})

// Create new submission
router.post('/', (req: Request, res: Response) => {
  // TODO: Implement create submission logic
  res.json({ message: 'Create submission endpoint' })
})

// Get submission details
router.get('/:id', (req: Request, res: Response) => {
  // TODO: Implement get submission details logic
  res.json({ message: 'Get submission details endpoint' })
})

// Update submission status
// Requirement 16.4
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, studentId } = req.body

    if (!status || !['pending', 'approved', 'revision_needed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' })
    }

    // TODO: Implement actual database update
    // For now, create a mock submission object
    const submission = {
      id,
      studentId,
      code: '',
      language: '',
      status: status as 'pending' | 'approved' | 'revision_needed',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Broadcast submission status update to all clients
    // Property 4: Submission Status Transitions
    realtimeService.broadcastSubmissionStatusUpdate(submission)

    // Notify the student of the status update
    realtimeService.notifySubmissionStatusUpdate(studentId, submission)

    res.json({
      message: 'Submission status updated',
      submission,
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update submission status' })
  }
})

// Generate AI feedback for a submission
// Requirement 6.1, 6.2, 6.3, 6.4, 6.5, 16.3
router.post('/:id/feedback', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { studentId } = req.body

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' })
    }

    const feedback = await aiFeedbackService.generateFeedback(id)

    // Notify student that feedback is available
    // Property 5: AI Feedback Confidence Validity
    realtimeService.notifyFeedbackAvailable(studentId, feedback, id)

    res.json(feedback)
  } catch (error) {
    console.error('Error generating feedback:', error)
    res.status(500).json({ error: 'Failed to generate feedback' })
  }
})

// Get AI feedback for a submission
router.get('/:id/feedback', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const feedback = await aiFeedbackService.getFeedback(id)
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' })
    }
    res.json(feedback)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    res.status(500).json({ error: 'Failed to fetch feedback' })
  }
})

export default router
