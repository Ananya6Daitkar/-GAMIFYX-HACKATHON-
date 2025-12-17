import { describe, it, expect, beforeEach, vi } from 'vitest'
import feedbackService from './feedbackService'
import feedbackRepository from '../database/repositories/feedbackRepository'
import userRepository from '../database/repositories/userRepository'

// Mock repositories
vi.mock('../database/repositories/feedbackRepository')
vi.mock('../database/repositories/userRepository')

describe('FeedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createFeedback', () => {
    it('should create feedback with valid input', async () => {
      const userId = 'user-123'
      const mockUser = { id: userId, username: 'testuser', role: 'student' }
      const mockFeedback = {
        id: 'feedback-1',
        userId,
        category: 'technical',
        subject: 'Bug Report',
        message: 'I found a bug in the submission system',
        attachments: [],
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any)
      vi.mocked(feedbackRepository.create).mockResolvedValue(mockFeedback as any)
      vi.mocked(feedbackRepository.updateStatus).mockResolvedValue(mockFeedback as any)

      const result = await feedbackService.createFeedback(userId, {
        category: 'technical',
        subject: 'Bug Report',
        message: 'I found a bug in the submission system',
      })

      expect(result.feedback).toEqual(mockFeedback)
      expect(result.ticketNumber).toBeDefined()
      expect(result.ticketNumber).toMatch(/^TKT-/)
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(feedbackRepository.create).toHaveBeenCalled()
    })

    it('should throw error if user not found', async () => {
      const userId = 'nonexistent-user'
      vi.mocked(userRepository.findById).mockResolvedValue(null)

      await expect(
        feedbackService.createFeedback(userId, {
          category: 'technical',
          subject: 'Bug Report',
          message: 'I found a bug in the submission system',
        })
      ).rejects.toThrow('User not found')
    })

    it('should throw error if category is missing', async () => {
      const userId = 'user-123'
      const mockUser = { id: userId, username: 'testuser', role: 'student' }
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any)

      await expect(
        feedbackService.createFeedback(userId, {
          category: '',
          subject: 'Bug Report',
          message: 'I found a bug in the submission system',
        })
      ).rejects.toThrow('Category, subject, and message are required')
    })

    it('should throw error if subject is too short', async () => {
      const userId = 'user-123'
      const mockUser = { id: userId, username: 'testuser', role: 'student' }
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any)

      await expect(
        feedbackService.createFeedback(userId, {
          category: 'technical',
          subject: 'Hi',
          message: 'I found a bug in the submission system',
        })
      ).rejects.toThrow('Subject must be between 3 and 255 characters')
    })

    it('should throw error if message is too short', async () => {
      const userId = 'user-123'
      const mockUser = { id: userId, username: 'testuser', role: 'student' }
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any)

      await expect(
        feedbackService.createFeedback(userId, {
          category: 'technical',
          subject: 'Bug Report',
          message: 'Short',
        })
      ).rejects.toThrow('Message must be between 10 and 5000 characters')
    })
  })

  describe('getFeedbackById', () => {
    it('should return feedback by id', async () => {
      const feedbackId = 'feedback-1'
      const mockFeedback = {
        id: feedbackId,
        userId: 'user-123',
        category: 'technical',
        subject: 'Bug Report',
        message: 'I found a bug',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(feedbackRepository.findById).mockResolvedValue(mockFeedback as any)

      const result = await feedbackService.getFeedbackById(feedbackId)

      expect(result).toEqual(mockFeedback)
      expect(feedbackRepository.findById).toHaveBeenCalledWith(feedbackId)
    })

    it('should return null if feedback not found', async () => {
      const feedbackId = 'nonexistent'
      vi.mocked(feedbackRepository.findById).mockResolvedValue(null)

      const result = await feedbackService.getFeedbackById(feedbackId)

      expect(result).toBeNull()
    })
  })

  describe('getUserFeedback', () => {
    it('should return all feedback for a user', async () => {
      const userId = 'user-123'
      const mockFeedback = [
        {
          id: 'feedback-1',
          userId,
          category: 'technical',
          subject: 'Bug Report',
          message: 'I found a bug',
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(feedbackRepository.getByUserId).mockResolvedValue(mockFeedback as any)

      const result = await feedbackService.getUserFeedback(userId)

      expect(result).toEqual(mockFeedback)
      expect(feedbackRepository.getByUserId).toHaveBeenCalledWith(userId)
    })
  })

  describe('updateFeedbackStatus', () => {
    it('should update feedback status', async () => {
      const feedbackId = 'feedback-1'
      const userId = 'user-123'
      const mockFeedback = {
        id: feedbackId,
        userId,
        category: 'technical',
        subject: 'Bug Report',
        message: 'I found a bug',
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(feedbackRepository.findById).mockResolvedValue(mockFeedback as any)
      vi.mocked(feedbackRepository.updateStatus).mockResolvedValue(mockFeedback as any)

      const result = await feedbackService.updateFeedbackStatus(feedbackId, 'in_progress', userId)

      expect(result).toEqual(mockFeedback)
      expect(feedbackRepository.updateStatus).toHaveBeenCalledWith(feedbackId, 'in_progress', userId)
    })

    it('should throw error if feedback not found', async () => {
      const feedbackId = 'nonexistent'
      vi.mocked(feedbackRepository.findById).mockResolvedValue(null)

      await expect(
        feedbackService.updateFeedbackStatus(feedbackId, 'in_progress', 'user-123')
      ).rejects.toThrow('Feedback not found')
    })
  })

  describe('assignFeedback', () => {
    it('should assign feedback to a teacher', async () => {
      const feedbackId = 'feedback-1'
      const assignedTo = 'teacher-123'
      const actor = 'admin-123'
      const mockFeedback = {
        id: feedbackId,
        userId: 'user-123',
        category: 'technical',
        subject: 'Bug Report',
        message: 'I found a bug',
        status: 'open',
        assignedTo,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockTeacher = { id: assignedTo, role: 'teacher' }

      vi.mocked(feedbackRepository.findById).mockResolvedValue(mockFeedback as any)
      vi.mocked(userRepository.findById).mockResolvedValue(mockTeacher as any)
      vi.mocked(feedbackRepository.assignTo).mockResolvedValue(mockFeedback as any)

      const result = await feedbackService.assignFeedback(feedbackId, assignedTo, actor)

      expect(result).toEqual(mockFeedback)
      expect(feedbackRepository.assignTo).toHaveBeenCalledWith(feedbackId, assignedTo, actor)
    })

    it('should throw error if assigned user is not a teacher', async () => {
      const feedbackId = 'feedback-1'
      const assignedTo = 'student-123'
      const actor = 'admin-123'
      const mockFeedback = {
        id: feedbackId,
        userId: 'user-123',
        category: 'technical',
        subject: 'Bug Report',
        message: 'I found a bug',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockStudent = { id: assignedTo, role: 'student' }

      vi.mocked(feedbackRepository.findById).mockResolvedValue(mockFeedback as any)
      vi.mocked(userRepository.findById).mockResolvedValue(mockStudent as any)

      await expect(
        feedbackService.assignFeedback(feedbackId, assignedTo, actor)
      ).rejects.toThrow('Assigned user must be a teacher or admin')
    })
  })

  describe('getAllFeedback', () => {
    it('should return all feedback', async () => {
      const mockFeedback = [
        {
          id: 'feedback-1',
          userId: 'user-123',
          category: 'technical',
          subject: 'Bug Report',
          message: 'I found a bug',
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(feedbackRepository.getAll).mockResolvedValue(mockFeedback as any)

      const result = await feedbackService.getAllFeedback()

      expect(result).toEqual(mockFeedback)
      expect(feedbackRepository.getAll).toHaveBeenCalled()
    })
  })

  describe('getFeedbackByStatus', () => {
    it('should return feedback by status', async () => {
      const status = 'open'
      const mockFeedback = [
        {
          id: 'feedback-1',
          userId: 'user-123',
          category: 'technical',
          subject: 'Bug Report',
          message: 'I found a bug',
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(feedbackRepository.getByStatus).mockResolvedValue(mockFeedback as any)

      const result = await feedbackService.getFeedbackByStatus(status)

      expect(result).toEqual(mockFeedback)
      expect(feedbackRepository.getByStatus).toHaveBeenCalledWith(status)
    })
  })
})
