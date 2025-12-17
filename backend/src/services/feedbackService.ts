import { Feedback, AuditEntry } from '../database/models'
import feedbackRepository from '../database/repositories/feedbackRepository'
import userRepository from '../database/repositories/userRepository'
import { v4 as uuidv4 } from 'uuid'

export class FeedbackService {
  /**
   * Generate a unique ticket number for feedback
   */
  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TKT-${timestamp}-${random}`
  }

  /**
   * Route feedback to appropriate mentor/teacher based on category
   */
  private async routeFeedback(category: string): Promise<string | undefined> {
    // Categories: 'technical', 'general', 'assignment', 'other'
    // Route to teachers/mentors based on category
    const categoryRouting: Record<string, string> = {
      technical: 'technical_mentor',
      assignment: 'assignment_mentor',
      general: 'general_support',
      other: 'general_support',
    }

    const routingKey = categoryRouting[category.toLowerCase()] || 'general_support'

    // Find a user with the appropriate role/tag
    // For now, we'll return undefined and let the admin assign manually
    // In a real system, this would query for users with specific tags
    return undefined
  }

  /**
   * Create feedback/contact form submission
   */
  async createFeedback(
    userId: string,
    data: {
      category: string
      subject: string
      message: string
      attachments?: string[]
    }
  ): Promise<{ feedback: Feedback; ticketNumber: string }> {
    // Verify user exists
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Validate input
    if (!data.category || !data.subject || !data.message) {
      throw new Error('Category, subject, and message are required')
    }

    if (data.subject.length < 3 || data.subject.length > 255) {
      throw new Error('Subject must be between 3 and 255 characters')
    }

    if (data.message.length < 10 || data.message.length > 5000) {
      throw new Error('Message must be between 10 and 5000 characters')
    }

    // Route feedback to appropriate mentor/teacher
    const assignedTo = await this.routeFeedback(data.category)

    // Create feedback record
    const feedback = await feedbackRepository.create({
      userId,
      category: data.category,
      subject: data.subject,
      message: data.message,
      attachments: data.attachments || [],
      assignedTo,
      status: 'open',
    })

    // Generate ticket number
    const ticketNumber = this.generateTicketNumber()

    // Add ticket number to audit trail
    const auditTrail = feedback.auditTrail || []
    auditTrail.push({
      timestamp: new Date(),
      action: 'ticket_generated',
      actor: 'system',
      details: `Ticket number: ${ticketNumber}`,
    })

    // Update feedback with ticket number in audit trail
    await feedbackRepository.updateStatus(feedback.id, 'open', 'system')

    return { feedback, ticketNumber }
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(feedbackId: string): Promise<Feedback | null> {
    return feedbackRepository.findById(feedbackId)
  }

  /**
   * Get all feedback for a user
   */
  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return feedbackRepository.getByUserId(userId)
  }

  /**
   * Get all feedback assigned to a mentor/teacher
   */
  async getAssignedFeedback(userId: string): Promise<Feedback[]> {
    return feedbackRepository.getAssignedTo(userId)
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(
    feedbackId: string,
    status: 'open' | 'in_progress' | 'resolved',
    actor: string
  ): Promise<Feedback> {
    const feedback = await feedbackRepository.findById(feedbackId)
    if (!feedback) {
      throw new Error('Feedback not found')
    }

    return feedbackRepository.updateStatus(feedbackId, status, actor)
  }

  /**
   * Assign feedback to a mentor/teacher
   */
  async assignFeedback(
    feedbackId: string,
    assignedTo: string,
    actor: string
  ): Promise<Feedback> {
    const feedback = await feedbackRepository.findById(feedbackId)
    if (!feedback) {
      throw new Error('Feedback not found')
    }

    // Verify assigned user exists and is a mentor/teacher
    const assignedUser = await userRepository.findById(assignedTo)
    if (!assignedUser || (assignedUser.role !== 'teacher' && assignedUser.role !== 'admin')) {
      throw new Error('Assigned user must be a teacher or admin')
    }

    return feedbackRepository.assignTo(feedbackId, assignedTo, actor)
  }

  /**
   * Get all feedback (admin only)
   */
  async getAllFeedback(): Promise<Feedback[]> {
    return feedbackRepository.getAll()
  }

  /**
   * Get feedback by status
   */
  async getFeedbackByStatus(status: string): Promise<Feedback[]> {
    return feedbackRepository.getByStatus(status)
  }

  /**
   * Send notification to assigned mentor (placeholder)
   */
  async notifyAssignedMentor(feedback: Feedback, ticketNumber: string): Promise<void> {
    if (!feedback.assignedTo) {
      return
    }

    // In a real system, this would:
    // 1. Send email notification
    // 2. Send in-app notification via WebSocket
    // 3. Send SMS if configured
    // For now, we'll just log it
    console.log(
      `Notification: New feedback assigned to ${feedback.assignedTo}. Ticket: ${ticketNumber}`
    )
  }
}

export default new FeedbackService()
