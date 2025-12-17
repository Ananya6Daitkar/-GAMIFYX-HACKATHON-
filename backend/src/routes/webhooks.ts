import express, { Router, Request, Response } from 'express'
import webhookService from '../services/githubWebhookService'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'

const router = Router()

/**
 * GitHub Webhook Handler
 * Receives push events from GitHub and processes auto-grading
 */
router.post('/github/push', async (req: Request, res: Response) => {
  try {
    // Get signature from headers
    const signature = req.headers['x-hub-signature-256'] as string
    if (!signature) {
      return res.status(401).json({ error: 'Missing webhook signature' })
    }

    // Get raw body for signature verification
    const rawBody = (req as any).rawBody || JSON.stringify(req.body)

    // Verify webhook signature
    try {
      if (!webhookService.verifyWebhookSignature(rawBody, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature' })
      }
    } catch (error) {
      return res.status(401).json({ error: 'Signature verification failed' })
    }

    // Get event type
    const eventType = req.headers['x-github-event'] as string
    if (eventType !== 'push') {
      return res.status(400).json({ error: 'Only push events are supported' })
    }

    // Get submission ID from query params or body
    const submissionId = req.query.submissionId as string || req.body.submissionId
    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submissionId parameter' })
    }

    // Verify submission exists
    const submission = await assignmentSubmissionRepository.findById(submissionId)
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    // Process the webhook
    const updatedSubmission = await webhookService.handlePushEvent(req.body, submissionId)

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      submission: updatedSubmission,
    })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: error.message || 'Failed to process webhook' })
  }
})

/**
 * Health check for webhook endpoint
 */
router.get('/github/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'github-webhook' })
})

export default router
