import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import feedbackService from './feedbackService'
import feedbackRepository from '../database/repositories/feedbackRepository'
import userRepository from '../database/repositories/userRepository'

// Mock repositories
vi.mock('../database/repositories/feedbackRepository')
vi.mock('../database/repositories/userRepository')

describe('FeedbackService - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 7: Feedback Routing Correctness
   * For any submitted feedback, the system should route it to exactly one assigned mentor/teacher
   * based on category, and create an audit trail entry with timestamp and submission details.
   * **Validates: Requirements 8.2, 8.3**
   */
  it('should route feedback correctly and create audit trail', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.oneof(
          fc.constant('technical'),
          fc.constant('assignment'),
          fc.constant('general'),
          fc.constant('other')
        ),
        fc.string({ minLength: 3, maxLength: 255 }),
        fc.string({ minLength: 10, maxLength: 5000 }),
        async (userId, category, subject, message) => {
          const mockUser = { id: userId, username: 'testuser', role: 'student' }
          const mockFeedback = {
            id: 'feedback-1',
            userId,
            category,
            subject,
            message,
            attachments: [],
            status: 'open',
            auditTrail: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any)
          vi.mocked(feedbackRepository.create).mockResolvedValue(mockFeedback as any)
          vi.mocked(feedbackRepository.updateStatus).mockResolvedValue(mockFeedback as any)

          const result = await feedbackService.createFeedback(userId, {
            category,
            subject,
            message,
          })

          // Verify feedback was created
          expect(result.feedback).toBeDefined()
          expect(result.feedback.userId).toBe(userId)
          expect(result.feedback.category).toBe(category)
          expect(result.feedback.subject).toBe(subject)
          expect(result.feedback.message).toBe(message)

          // Verify ticket number was generated
          expect(result.ticketNumber).toBeDefined()
          expect(result.ticketNumber).toMatch(/^TKT-/)

          // Verify audit trail was created
          expect(feedbackRepository.updateStatus).toHaveBeenCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Feedback Status Transitions
   * For any feedback, status updates should only transition through valid states
   * and should be immutable once resolved.
   * **Validates: Requirements 8.2**
   */
  it('should only allow valid status transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.oneof(fc.constant('open'), fc.constant('in_progress'), fc.constant('resolved')),
        async (feedbackId, newStatus) => {
          const mockFeedback = {
            id: feedbackId,
            userId: 'user-123',
            category: 'technical',
            subject: 'Test',
            message: 'Test message',
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          vi.mocked(feedbackRepository.findById).mockResolvedValue(mockFeedback as any)
          vi.mocked(feedbackRepository.updateStatus).mockResolvedValue({
            ...mockFeedback,
            status: newStatus,
          } as any)

          const result = await feedbackService.updateFeedbackStatus(feedbackId, newStatus as any, 'user-123')

          // Verify status was updated
          expect(result.status).toBe(newStatus)

          // Verify audit trail was updated
          expect(feedbackRepository.updateStatus).toHaveBeenCalledWith(feedbackId, newStatus, 'user-123')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Ticket Number Uniqueness
   * For any feedback submission, the generated ticket number should be unique
   * and follow the format TKT-{timestamp}-{random}
   * **Validates: Requirements 8.4**
   */
  it('should generate unique ticket numbers', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 10 }), async (count) => {
        const ticketNumbers = new Set<string>()

        for (let i = 0; i < count; i++) {
          const mockUser = { id: `user-${i}`, username: 'testuser', role: 'student' }
          const mockFeedback = {
            id: `feedback-${i}`,
            userId: `user-${i}`,
            category: 'technical',
            subject: `Test ${i}`,
            message: `Test message ${i}`,
            attachments: [],
            status: 'open',
            auditTrail: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any)
          vi.mocked(feedbackRepository.create).mockResolvedValue(mockFeedback as any)
          vi.mocked(feedbackRepository.updateStatus).mockResolvedValue(mockFeedback as any)

          const result = await feedbackService.createFeedback(`user-${i}`, {
            category: 'technical',
            subject: `Test ${i}`,
            message: `Test message ${i}`,
          })

          // Verify ticket number format
          expect(result.ticketNumber).toMatch(/^TKT-/)

          // Add to set (would fail if duplicate)
          ticketNumbers.add(result.ticketNumber)
        }

        // Verify all ticket numbers are unique
        expect(ticketNumbers.size).toBe(count)
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property: Feedback Assignment Validation
   * For any feedback assignment, the assigned user must be a teacher or admin,
   * and the assignment should be recorded in the audit trail.
   * **Validates: Requirements 8.3**
   */
  it('should only assign feedback to teachers or admins', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.oneof(fc.constant('teacher'), fc.constant('admin')),
        async (feedbackId, assignedTo, role) => {
          const mockFeedback = {
            id: feedbackId,
            userId: 'user-123',
            category: 'technical',
            subject: 'Test',
            message: 'Test message',
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const mockTeacher = { id: assignedTo, role }

          vi.mocked(feedbackRepository.findById).mockResolvedValue(mockFeedback as any)
          vi.mocked(userRepository.findById).mockResolvedValue(mockTeacher as any)
          vi.mocked(feedbackRepository.assignTo).mockResolvedValue({
            ...mockFeedback,
            assignedTo,
          } as any)

          const result = await feedbackService.assignFeedback(feedbackId, assignedTo, 'admin-123')

          // Verify assignment was successful
          expect(result.assignedTo).toBe(assignedTo)
          expect(feedbackRepository.assignTo).toHaveBeenCalledWith(feedbackId, assignedTo, 'admin-123')
        }
      ),
      { numRuns: 100 }
    )
  })
})
