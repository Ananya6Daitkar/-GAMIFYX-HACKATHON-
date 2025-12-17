import { Router, Request, Response } from 'express'
import assignmentService from '../services/assignmentService'

const router = Router()

// Create assignment (teachers only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const { title, description, difficulty, xpReward, requiredFiles, expectedFolderStructure, deadline } = req.body

    // Validate required fields
    if (!title || !description || !difficulty || !xpReward || !requiredFiles || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate difficulty
    if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' })
    }

    const assignment = await assignmentService.createAssignment(userId, {
      title,
      description,
      difficulty,
      xpReward,
      requiredFiles,
      expectedFolderStructure,
      deadline: new Date(deadline),
    })

    res.status(201).json(assignment)
  } catch (error: any) {
    console.error('Error creating assignment:', error)
    res.status(error.message.includes('Only teachers') ? 403 : 500).json({ error: error.message })
  }
})

// Get all assignments (for students)
router.get('/', async (req: Request, res: Response) => {
  try {
    const assignments = await assignmentService.getAllAssignments()
    res.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    res.status(500).json({ error: 'Failed to fetch assignments' })
  }
})

// Get teacher's assignments
router.get('/teacher/my-assignments', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const assignments = await assignmentService.getTeacherAssignments(userId)
    res.json(assignments)
  } catch (error) {
    console.error('Error fetching teacher assignments:', error)
    res.status(500).json({ error: 'Failed to fetch assignments' })
  }
})

// Get single assignment
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const assignment = await assignmentService.getAssignmentById(id)

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    res.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    res.status(500).json({ error: 'Failed to fetch assignment' })
  }
})

// Update assignment (teachers only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const { id } = req.params
    const updates = req.body

    const assignment = await assignmentService.updateAssignment(id, userId, updates)
    res.json(assignment)
  } catch (error: any) {
    console.error('Error updating assignment:', error)
    res.status(error.message.includes('not found') ? 404 : error.message.includes('creator') ? 403 : 500).json({
      error: error.message,
    })
  }
})

// Delete assignment (teachers only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const { id } = req.params

    const success = await assignmentService.deleteAssignment(id, userId)

    if (!success) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    res.json({ success: true, message: 'Assignment deleted' })
  } catch (error: any) {
    console.error('Error deleting assignment:', error)
    res.status(error.message.includes('not found') ? 404 : error.message.includes('creator') ? 403 : 500).json({
      error: error.message,
    })
  }
})

// Student accepts assignment
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const { id } = req.params
    const { githubRepoUrl, githubBranch } = req.body

    if (!githubRepoUrl) {
      return res.status(400).json({ error: 'GitHub repository URL is required' })
    }

    const submission = await assignmentService.acceptAssignment(
      id,
      userId,
      githubRepoUrl,
      githubBranch || 'main'
    )

    res.status(201).json(submission)
  } catch (error: any) {
    console.error('Error accepting assignment:', error)
    res.status(error.message.includes('not found') ? 404 : error.message.includes('already') ? 409 : 500).json({
      error: error.message,
    })
  }
})

// Get student's submissions
router.get('/submissions/my-submissions', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const submissions = await assignmentService.getStudentSubmissions(userId)
    res.json(submissions)
  } catch (error) {
    console.error('Error fetching student submissions:', error)
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
})

// Get submissions for an assignment (teachers only)
router.get('/:id/submissions', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const { id } = req.params

    // Verify teacher owns this assignment
    const assignment = await assignmentService.getAssignmentById(id)
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    if (assignment.teacherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const submissions = await assignmentService.getAssignmentSubmissions(id)
    res.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
})

// Get submission details
router.get('/submissions/:submissionId', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params
    const submission = await assignmentService.getSubmissionById(submissionId)

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    res.json(submission)
  } catch (error) {
    console.error('Error fetching submission:', error)
    res.status(500).json({ error: 'Failed to fetch submission' })
  }
})

// Update submission status (teachers only)
router.patch('/submissions/:submissionId/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const { submissionId } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    // Verify teacher owns the assignment
    const submission = await assignmentService.getSubmissionById(submissionId)
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    const assignment = await assignmentService.getAssignmentById(submission.assignmentId)
    if (!assignment || assignment.teacherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const updated = await assignmentService.updateSubmissionStatus(submissionId, status)
    res.json(updated)
  } catch (error: any) {
    console.error('Error updating submission status:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update submission grade and XP (teachers only)
router.patch('/submissions/:submissionId/grade', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware
    const { submissionId } = req.params
    const { score, xpEarned } = req.body

    if (score === undefined || xpEarned === undefined) {
      return res.status(400).json({ error: 'Score and xpEarned are required' })
    }

    // Verify teacher owns the assignment
    const submission = await assignmentService.getSubmissionById(submissionId)
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    const assignment = await assignmentService.getAssignmentById(submission.assignmentId)
    if (!assignment || assignment.teacherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const updated = await assignmentService.updateSubmissionGradeAndXP(submissionId, score, xpEarned)
    res.json(updated)
  } catch (error: any) {
    console.error('Error updating submission grade:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
