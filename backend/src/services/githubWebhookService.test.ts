import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GitHubWebhookService } from './githubWebhookService'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'
import assignmentRepository from '../database/repositories/assignmentRepository'
import userRepository from '../database/repositories/userRepository'
import githubWebhookRepository from '../database/repositories/githubWebhookRepository'
import badgeRepository from '../database/repositories/badgeRepository'
import assignmentService from './assignmentService'
import githubPushToXpService from './githubPushToXpService'

// Mock dependencies
vi.mock('../database/repositories/assignmentSubmissionRepository')
vi.mock('../database/repositories/assignmentRepository')
vi.mock('../database/repositories/userRepository')
vi.mock('../database/repositories/githubWebhookRepository')
vi.mock('../database/repositories/badgeRepository')
vi.mock('./assignmentService')
vi.mock('./githubPushToXpService')

describe('GitHubWebhookService', () => {
  let webhookService: GitHubWebhookService
  const webhookSecret = 'test-secret'

  beforeEach(() => {
    webhookService = new GitHubWebhookService(webhookSecret)
    vi.clearAllMocks()
  })

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const crypto = require('crypto')
      const hash = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex')
      const signature = `sha256=${hash}`

      const isValid = webhookService.verifyWebhookSignature(payload, signature)
      expect(isValid).toBe(true)
    })

    it('should reject invalid webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const invalidSignature = 'sha256=invalid'

      const isValid = webhookService.verifyWebhookSignature(payload, invalidSignature)
      expect(isValid).toBe(false)
    })
  })

  describe('handlePushEvent', () => {
    it('should process push event and update submission', async () => {
      const submissionId = 'sub-123'
      const studentId = 'student-123'
      const assignmentId = 'assign-123'

      const mockSubmission = {
        id: submissionId,
        studentId,
        assignmentId,
        status: 'IN_PROGRESS',
        githubRepoUrl: 'https://github.com/user/repo',
        githubBranch: 'main',
        autoGradeScore: null,
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockAssignment = {
        id: assignmentId,
        teacherId: 'teacher-123',
        title: 'Test Assignment',
        description: 'Test',
        difficulty: 'MEDIUM' as const,
        xpReward: 100,
        requiredFiles: ['main.js'],
        expectedFolderStructure: 'src/',
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockPayload = {
        ref: 'refs/heads/main',
        before: 'abc123',
        after: 'def456',
        repository: {
          id: 12345,
          name: 'repo',
          full_name: 'user/repo',
          owner: { name: 'User', login: 'user' },
        },
        pusher: { name: 'User', email: 'user@example.com' },
        commits: [
          {
            id: 'def456',
            message: 'Add main.js implementation',
            timestamp: new Date().toISOString(),
            author: { name: 'User', email: 'user@example.com' },
            added: ['main.js'],
            removed: [],
            modified: [],
          },
        ],
        head_commit: {
          id: 'def456',
          message: 'Add main.js implementation',
          timestamp: new Date().toISOString(),
          author: { name: 'User', email: 'user@example.com' },
          added: ['main.js'],
          removed: [],
          modified: [],
        },
      }

      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(mockSubmission as any)
      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment as any)
      vi.mocked(assignmentSubmissionRepository.updateGradeAndXP).mockResolvedValue({
        ...mockSubmission,
        autoGradeScore: 50,
        xpEarned: 50,
      } as any)
      vi.mocked(assignmentSubmissionRepository.updateStatus).mockResolvedValue({
        ...mockSubmission,
        status: 'REVIEW',
        autoGradeScore: 50,
        xpEarned: 50,
      } as any)
      vi.mocked(userRepository.findById).mockResolvedValue({
        id: studentId,
        username: 'student',
        email: 'student@example.com',
        passwordHash: 'hash',
        level: 1,
        totalXp: 0,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      vi.mocked(assignmentService.calculateXPReward).mockReturnValue(55)
      vi.mocked(userRepository.updateXP).mockResolvedValue({
        id: studentId,
        username: 'student',
        email: 'student@example.com',
        passwordHash: 'hash',
        level: 1,
        totalXp: 55,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      vi.mocked(githubWebhookRepository.create).mockResolvedValue({
        id: 'webhook-123',
        assignmentSubmissionId: submissionId,
        webhookId: 12345,
        repositoryName: 'repo',
        lastPushSha: 'def456',
        lastPushTimestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      vi.mocked(githubPushToXpService.processPushAndAwardXP).mockResolvedValue({
        xpEarned: 55,
        leveledUp: false,
        newLevel: 1,
        badgesUnlocked: [],
        user: {
          id: studentId,
          username: 'student',
          email: 'student@example.com',
          passwordHash: 'hash',
          level: 1,
          totalXp: 55,
          role: 'student',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any)

      const result = await webhookService.handlePushEvent(mockPayload as any, submissionId)

      expect(result.status).toBe('REVIEW')
      expect(assignmentSubmissionRepository.updateGradeAndXP).toHaveBeenCalled()
      expect(githubPushToXpService.processPushAndAwardXP).toHaveBeenCalledWith(studentId, submissionId, 55)
      expect(githubWebhookRepository.create).toHaveBeenCalled()
    })

    it('should throw error if submission not found', async () => {
      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(null)

      const mockPayload = {
        ref: 'refs/heads/main',
        before: 'abc123',
        after: 'def456',
        repository: {
          id: 12345,
          name: 'repo',
          full_name: 'user/repo',
          owner: { name: 'User', login: 'user' },
        },
        pusher: { name: 'User', email: 'user@example.com' },
        commits: [],
        head_commit: null,
      }

      await expect(webhookService.handlePushEvent(mockPayload as any, 'invalid-id')).rejects.toThrow(
        'Submission not found'
      )
    })
  })

  describe('Auto-grading logic', () => {
    it('should grade commit message quality', () => {
      const commits = [
        { message: 'Add comprehensive feature implementation', added: [], removed: [], modified: [] },
        { message: 'Fix critical bug in parser', added: [], removed: [], modified: [] },
        { message: 'Update documentation', added: [], removed: [], modified: [] },
      ]

      // Access private method through type casting for testing
      const service = webhookService as any
      const score = service.gradeCommitMessageQuality(commits)

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(10)
    })

    it('should grade commit count', () => {
      const commits = [
        { message: 'Commit 1', added: [], removed: [], modified: [] },
        { message: 'Commit 2', added: [], removed: [], modified: [] },
        { message: 'Commit 3', added: [], removed: [], modified: [] },
        { message: 'Commit 4', added: [], removed: [], modified: [] },
        { message: 'Commit 5', added: [], removed: [], modified: [] },
      ]

      const service = webhookService as any
      const score = service.gradeCommitCount(commits)

      expect(score).toBe(10) // 5 commits should get full score
    })

    it('should grade lines balance', () => {
      const commits = [
        {
          message: 'Add feature',
          added: ['file1.js', 'file2.js', 'file3.js'],
          removed: ['old.js'],
          modified: [],
        },
      ]

      const service = webhookService as any
      const score = service.gradeLinesBalance(commits)

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(15)
    })

    it('should grade required files presence', () => {
      const payload = {
        commits: [
          {
            added: ['src/main.js', 'src/utils.js'],
            removed: [],
            modified: [],
            message: 'Add implementation',
          },
        ],
        head_commit: null,
      }

      const requiredFiles = ['main.js', 'utils.js']

      const service = webhookService as any
      const score = service.gradeRequiredFiles(payload, requiredFiles)

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(20)
    })

    it('should grade README quality', () => {
      const payload = {
        commits: [
          {
            added: ['README.md'],
            removed: [],
            modified: [],
            message: 'Add README documentation',
          },
        ],
        head_commit: null,
      }

      const service = webhookService as any
      const score = service.gradeReadmeQuality(payload)

      expect(score).toBe(20) // README added with explicit mention
    })
  })

  describe('Status determination', () => {
    it('should assign PASS status for score >= 80', async () => {
      const submissionId = 'sub-123'
      const mockSubmission = {
        id: submissionId,
        studentId: 'student-123',
        assignmentId: 'assign-123',
        status: 'IN_PROGRESS',
        githubRepoUrl: 'https://github.com/user/repo',
        githubBranch: 'main',
        autoGradeScore: null,
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockAssignment = {
        id: 'assign-123',
        teacherId: 'teacher-123',
        title: 'Test',
        description: 'Test',
        difficulty: 'EASY' as const,
        xpReward: 100,
        requiredFiles: [],
        expectedFolderStructure: undefined,
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockPayload = {
        ref: 'refs/heads/main',
        before: 'abc123',
        after: 'def456',
        repository: {
          id: 12345,
          name: 'repo',
          full_name: 'user/repo',
          owner: { name: 'User', login: 'user' },
        },
        pusher: { name: 'User', email: 'user@example.com' },
        commits: [
          {
            id: 'def456',
            message: 'Comprehensive implementation with good structure',
            timestamp: new Date().toISOString(),
            author: { name: 'User', email: 'user@example.com' },
            added: ['main.js', 'utils.js', 'README.md'],
            removed: [],
            modified: [],
          },
          {
            id: 'def457',
            message: 'Add tests and documentation',
            timestamp: new Date().toISOString(),
            author: { name: 'User', email: 'user@example.com' },
            added: ['test.js'],
            removed: [],
            modified: ['README.md'],
          },
        ],
        head_commit: {
          id: 'def457',
          message: 'Add tests and documentation',
          timestamp: new Date().toISOString(),
          author: { name: 'User', email: 'user@example.com' },
          added: ['test.js'],
          removed: [],
          modified: ['README.md'],
        },
      }

      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(mockSubmission as any)
      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment as any)
      vi.mocked(assignmentSubmissionRepository.updateGradeAndXP).mockResolvedValue({
        ...mockSubmission,
        autoGradeScore: 85,
        xpEarned: 100,
      } as any)
      vi.mocked(assignmentSubmissionRepository.updateStatus).mockResolvedValue({
        ...mockSubmission,
        status: 'PASS',
        autoGradeScore: 85,
        xpEarned: 100,
      } as any)
      vi.mocked(assignmentService.calculateXPReward).mockReturnValue(100)
      vi.mocked(userRepository.updateXP).mockResolvedValue({} as any)
      vi.mocked(githubWebhookRepository.create).mockResolvedValue({} as any)

      const result = await webhookService.handlePushEvent(mockPayload as any, submissionId)

      expect(result.status).toBe('PASS')
    })

    it('should assign REVIEW status for score 50-79', async () => {
      const submissionId = 'sub-123'
      const mockSubmission = {
        id: submissionId,
        studentId: 'student-123',
        assignmentId: 'assign-123',
        status: 'IN_PROGRESS',
        githubRepoUrl: 'https://github.com/user/repo',
        githubBranch: 'main',
        autoGradeScore: null,
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockAssignment = {
        id: 'assign-123',
        teacherId: 'teacher-123',
        title: 'Test',
        description: 'Test',
        difficulty: 'EASY' as const,
        xpReward: 100,
        requiredFiles: [],
        expectedFolderStructure: undefined,
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockPayload = {
        ref: 'refs/heads/main',
        before: 'abc123',
        after: 'def456',
        repository: {
          id: 12345,
          name: 'repo',
          full_name: 'user/repo',
          owner: { name: 'User', login: 'user' },
        },
        pusher: { name: 'User', email: 'user@example.com' },
        commits: [
          {
            id: 'def456',
            message: 'Add implementation',
            timestamp: new Date().toISOString(),
            author: { name: 'User', email: 'user@example.com' },
            added: ['main.js'],
            removed: [],
            modified: [],
          },
        ],
        head_commit: {
          id: 'def456',
          message: 'Add implementation',
          timestamp: new Date().toISOString(),
          author: { name: 'User', email: 'user@example.com' },
          added: ['main.js'],
          removed: [],
          modified: [],
        },
      }

      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(mockSubmission as any)
      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment as any)
      vi.mocked(assignmentSubmissionRepository.updateGradeAndXP).mockResolvedValue({
        ...mockSubmission,
        autoGradeScore: 65,
        xpEarned: 50,
      } as any)
      vi.mocked(assignmentSubmissionRepository.updateStatus).mockResolvedValue({
        ...mockSubmission,
        status: 'REVIEW',
        autoGradeScore: 65,
        xpEarned: 50,
      } as any)
      vi.mocked(assignmentService.calculateXPReward).mockReturnValue(50)
      vi.mocked(userRepository.updateXP).mockResolvedValue({} as any)
      vi.mocked(githubWebhookRepository.create).mockResolvedValue({} as any)

      const result = await webhookService.handlePushEvent(mockPayload as any, submissionId)

      expect(result.status).toBe('REVIEW')
    })

    it('should assign FAIL status for score < 50', async () => {
      const submissionId = 'sub-123'
      const mockSubmission = {
        id: submissionId,
        studentId: 'student-123',
        assignmentId: 'assign-123',
        status: 'IN_PROGRESS',
        githubRepoUrl: 'https://github.com/user/repo',
        githubBranch: 'main',
        autoGradeScore: null,
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockAssignment = {
        id: 'assign-123',
        teacherId: 'teacher-123',
        title: 'Test',
        description: 'Test',
        difficulty: 'EASY' as const,
        xpReward: 100,
        requiredFiles: ['main.js'],
        expectedFolderStructure: undefined,
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockPayload = {
        ref: 'refs/heads/main',
        before: 'abc123',
        after: 'def456',
        repository: {
          id: 12345,
          name: 'repo',
          full_name: 'user/repo',
          owner: { name: 'User', login: 'user' },
        },
        pusher: { name: 'User', email: 'user@example.com' },
        commits: [
          {
            id: 'def456',
            message: 'x',
            timestamp: new Date().toISOString(),
            author: { name: 'User', email: 'user@example.com' },
            added: [],
            removed: [],
            modified: [],
          },
        ],
        head_commit: {
          id: 'def456',
          message: 'x',
          timestamp: new Date().toISOString(),
          author: { name: 'User', email: 'user@example.com' },
          added: [],
          removed: [],
          modified: [],
        },
      }

      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(mockSubmission as any)
      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment as any)
      vi.mocked(assignmentSubmissionRepository.updateGradeAndXP).mockResolvedValue({
        ...mockSubmission,
        autoGradeScore: 30,
        xpEarned: 0,
      } as any)
      vi.mocked(assignmentSubmissionRepository.updateStatus).mockResolvedValue({
        ...mockSubmission,
        status: 'FAIL',
        autoGradeScore: 30,
        xpEarned: 0,
      } as any)
      vi.mocked(assignmentService.calculateXPReward).mockReturnValue(0)
      vi.mocked(userRepository.updateXP).mockResolvedValue({} as any)
      vi.mocked(githubWebhookRepository.create).mockResolvedValue({} as any)

      const result = await webhookService.handlePushEvent(mockPayload as any, submissionId)

      expect(result.status).toBe('FAIL')
    })
  })
})
