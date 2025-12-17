import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AIFeedbackService } from './aiFeedbackService'
import aiFeedbackRepository from '../database/repositories/aiFeedbackRepository'
import submissionRepository from '../database/repositories/submissionRepository'
import assignmentRepository from '../database/repositories/assignmentRepository'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'

// Mock the repositories
vi.mock('../database/repositories/aiFeedbackRepository')
vi.mock('../database/repositories/submissionRepository')
vi.mock('../database/repositories/assignmentRepository')
vi.mock('../database/repositories/assignmentSubmissionRepository')

describe('AIFeedbackService', () => {
  let service: AIFeedbackService

  beforeEach(() => {
    service = new AIFeedbackService()
    vi.clearAllMocks()
  })

  describe('generateFeedback', () => {
    it('should return existing feedback if already generated', async () => {
      const submissionId = 'sub-123'
      const existingFeedback = {
        id: 'feedback-123',
        submissionId,
        insights: ['Good code'],
        confidenceScore: 85,
        codeReferences: [],
        generatedAt: new Date(),
      }

      vi.mocked(submissionRepository.findById).mockResolvedValue({
        id: submissionId,
        studentId: 'student-123',
        code: 'console.log("hello")',
        language: 'javascript',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(
        existingFeedback
      )

      const result = await service.generateFeedback(submissionId)

      expect(result).toEqual(existingFeedback)
      expect(aiFeedbackRepository.create).not.toHaveBeenCalled()
    })

    it('should throw error if submission not found', async () => {
      const submissionId = 'non-existent'

      vi.mocked(submissionRepository.findById).mockResolvedValue(null)

      await expect(service.generateFeedback(submissionId)).rejects.toThrow(
        'Submission non-existent not found'
      )
    })

    it('should generate new feedback if not exists', async () => {
      const submissionId = 'sub-123'
      const submission = {
        id: submissionId,
        studentId: 'student-123',
        code: 'console.log("hello")',
        language: 'javascript',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const newFeedback = {
        id: 'feedback-123',
        submissionId,
        insights: ['Good code'],
        confidenceScore: 75,
        codeReferences: [],
        generatedAt: new Date(),
      }

      vi.mocked(submissionRepository.findById).mockResolvedValue(submission)
      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(null)
      vi.mocked(aiFeedbackRepository.create).mockResolvedValue(newFeedback)

      // Mock fetch for Ollama
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: JSON.stringify({
            insights: ['Good code'],
            confidence: 75,
            codeReferences: [],
          }),
        }),
      })

      const result = await service.generateFeedback(submissionId)

      expect(result).toEqual(newFeedback)
      expect(aiFeedbackRepository.create).toHaveBeenCalled()
    })
  })

  describe('getFeedback', () => {
    it('should return feedback for submission', async () => {
      const submissionId = 'sub-123'
      const feedback = {
        id: 'feedback-123',
        submissionId,
        insights: ['Good code'],
        confidenceScore: 85,
        codeReferences: [],
        generatedAt: new Date(),
      }

      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(
        feedback
      )

      const result = await service.getFeedback(submissionId)

      expect(result).toEqual(feedback)
    })

    it('should return null if feedback not found', async () => {
      const submissionId = 'sub-123'

      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(null)

      const result = await service.getFeedback(submissionId)

      expect(result).toBeNull()
    })
  })

  describe('getAllFeedback', () => {
    it('should return all feedback', async () => {
      const feedbackList = [
        {
          id: 'feedback-1',
          submissionId: 'sub-1',
          insights: ['Good code'],
          confidenceScore: 85,
          codeReferences: [],
          generatedAt: new Date(),
        },
        {
          id: 'feedback-2',
          submissionId: 'sub-2',
          insights: ['Needs improvement'],
          confidenceScore: 60,
          codeReferences: [],
          generatedAt: new Date(),
        },
      ]

      vi.mocked(aiFeedbackRepository.getAll).mockResolvedValue(feedbackList)

      const result = await service.getAllFeedback()

      expect(result).toEqual(feedbackList)
      expect(result).toHaveLength(2)
    })
  })

  describe('confidence score validation', () => {
    it('should clamp confidence score between 0-100', async () => {
      const submissionId = 'sub-123'
      const submission = {
        id: submissionId,
        studentId: 'student-123',
        code: 'console.log("hello")',
        language: 'javascript',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(submissionRepository.findById).mockResolvedValue(submission)
      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(null)

      // Mock fetch with invalid confidence scores
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            response: JSON.stringify({
              insights: ['Test'],
              confidence: 150, // Should be clamped to 100
              codeReferences: [],
            }),
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            response: JSON.stringify({
              insights: ['Test'],
              confidence: -50, // Should be clamped to 0
              codeReferences: [],
            }),
          }),
        })

      const newFeedback1 = {
        id: 'feedback-1',
        submissionId,
        insights: ['Test'],
        confidenceScore: 100,
        codeReferences: [],
        generatedAt: new Date(),
      }

      const newFeedback2 = {
        id: 'feedback-2',
        submissionId,
        insights: ['Test'],
        confidenceScore: 0,
        codeReferences: [],
        generatedAt: new Date(),
      }

      vi.mocked(aiFeedbackRepository.create)
        .mockResolvedValueOnce(newFeedback1)
        .mockResolvedValueOnce(newFeedback2)

      const result1 = await service.generateFeedback(submissionId)
      expect(result1.confidenceScore).toBe(100)

      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(null)
      const result2 = await service.generateFeedback(submissionId)
      expect(result2.confidenceScore).toBe(0)
    })
  })

  describe('fallback feedback', () => {
    it('should generate fallback feedback when Ollama fails', async () => {
      const submissionId = 'sub-123'
      const submission = {
        id: submissionId,
        studentId: 'student-123',
        code: 'console.log("hello")',
        language: 'javascript',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(submissionRepository.findById).mockResolvedValue(submission)
      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(null)

      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection failed'))

      const fallbackFeedback = {
        id: 'feedback-123',
        submissionId,
        insights: [
          'Code structure looks reasonable',
          'Consider adding comments for complex logic',
          'Ensure proper error handling is in place',
        ],
        confidenceScore: 30,
        codeReferences: [],
        generatedAt: new Date(),
      }

      vi.mocked(aiFeedbackRepository.create).mockResolvedValue(
        fallbackFeedback
      )

      const result = await service.generateFeedback(submissionId)

      expect(result.confidenceScore).toBe(30)
      expect(result.insights.length).toBeGreaterThan(0)
    })
  })

  describe('generateGitHubAssignmentFeedback', () => {
    it('should generate feedback for GitHub assignment submission with context', async () => {
      const assignmentSubmissionId = 'asub-123'
      const assignmentId = 'assign-123'
      const studentId = 'student-123'

      const submission = {
        id: assignmentSubmissionId,
        assignmentId,
        studentId,
        status: 'SUBMITTED' as const,
        githubRepoUrl: 'https://github.com/user/repo',
        githubBranch: 'main',
        autoGradeScore: 85,
        xpEarned: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const assignment = {
        id: assignmentId,
        teacherId: 'teacher-123',
        title: 'Build a Calculator',
        description: 'Create a simple calculator app',
        difficulty: 'EASY' as const,
        xpReward: 100,
        requiredFiles: ['index.js', 'README.md'],
        expectedFolderStructure: 'src/,tests/',
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const githubContext = {
        gitDiff: 'diff --git a/index.js b/index.js\n+console.log("hello")',
        scoreBreakdown: {
          commitMessageQuality: 8,
          commitCount: 5,
          linesBalance: 12,
          requiredFilesPresent: 18,
          folderStructure: 22,
          readmeQuality: 18,
        },
        totalScore: 83,
        commitMessages: ['Add calculator function', 'Fix bug in division', 'Update README'],
      }

      const newFeedback = {
        id: 'feedback-123',
        submissionId: assignmentSubmissionId,
        insights: ['Good code quality', 'Consider adding error handling'],
        confidenceScore: 80,
        codeReferences: [],
        generatedAt: new Date(),
      }

      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(submission)
      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(null)
      vi.mocked(assignmentRepository.findById).mockResolvedValue(assignment)
      vi.mocked(aiFeedbackRepository.create).mockResolvedValue(newFeedback)

      // Mock fetch for Ollama
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: JSON.stringify({
            insights: ['Good code quality', 'Consider adding error handling'],
            confidence: 80,
            codeReferences: [],
          }),
        }),
      })

      const result = await service.generateGitHubAssignmentFeedback(
        assignmentSubmissionId,
        githubContext
      )

      expect(result).toEqual(newFeedback)
      expect(aiFeedbackRepository.create).toHaveBeenCalled()
    })

    it('should throw error if assignment submission not found', async () => {
      const assignmentSubmissionId = 'non-existent'
      const githubContext = {
        gitDiff: 'diff',
        scoreBreakdown: {
          commitMessageQuality: 0,
          commitCount: 0,
          linesBalance: 0,
          requiredFilesPresent: 0,
          folderStructure: 0,
          readmeQuality: 0,
        },
        totalScore: 0,
        commitMessages: [],
      }

      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(null)

      await expect(
        service.generateGitHubAssignmentFeedback(assignmentSubmissionId, githubContext)
      ).rejects.toThrow('Assignment submission non-existent not found')
    })

    it('should handle Ollama timeout gracefully with low confidence fallback', async () => {
      const assignmentSubmissionId = 'asub-123'
      const assignmentId = 'assign-123'

      const submission = {
        id: assignmentSubmissionId,
        assignmentId,
        studentId: 'student-123',
        status: 'SUBMITTED' as const,
        githubRepoUrl: 'https://github.com/user/repo',
        githubBranch: 'main',
        autoGradeScore: 85,
        xpEarned: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const assignment = {
        id: assignmentId,
        teacherId: 'teacher-123',
        title: 'Build a Calculator',
        description: 'Create a simple calculator app',
        difficulty: 'EASY' as const,
        xpReward: 100,
        requiredFiles: ['index.js'],
        expectedFolderStructure: 'src/',
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const githubContext = {
        gitDiff: 'diff',
        scoreBreakdown: {
          commitMessageQuality: 8,
          commitCount: 5,
          linesBalance: 12,
          requiredFilesPresent: 18,
          folderStructure: 22,
          readmeQuality: 18,
        },
        totalScore: 83,
        commitMessages: ['Add feature'],
      }

      const fallbackFeedback = {
        id: 'feedback-123',
        submissionId: assignmentSubmissionId,
        insights: ['Good commit message quality - messages are descriptive and clear'],
        confidenceScore: 25,
        codeReferences: [],
        generatedAt: new Date(),
      }

      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(submission)
      vi.mocked(aiFeedbackRepository.findBySubmissionId).mockResolvedValue(null)
      vi.mocked(assignmentRepository.findById).mockResolvedValue(assignment)
      vi.mocked(aiFeedbackRepository.create).mockResolvedValue(fallbackFeedback)

      // Mock fetch to timeout
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AbortError')), 100)
          })
      )

      const result = await service.generateGitHubAssignmentFeedback(
        assignmentSubmissionId,
        githubContext
      )

      expect(result.confidenceScore).toBe(25)
      expect(result.insights.length).toBeGreaterThan(0)
    })
  })
})
