import { describe, it, expect, beforeEach, vi } from 'vitest'
import assignmentService from './assignmentService'
import assignmentRepository from '../database/repositories/assignmentRepository'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'
import userRepository from '../database/repositories/userRepository'

// Mock repositories
vi.mock('../database/repositories/assignmentRepository')
vi.mock('../database/repositories/assignmentSubmissionRepository')
vi.mock('../database/repositories/userRepository')

describe('AssignmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAssignment', () => {
    it('should create an assignment for a teacher', async () => {
      const teacherId = 'teacher-123'
      const mockTeacher = { id: teacherId, role: 'teacher' }
      const mockAssignment = {
        id: 'assignment-1',
        teacherId,
        title: 'Test Assignment',
        description: 'Test Description',
        difficulty: 'EASY' as const,
        xpReward: 100,
        requiredFiles: ['main.js'],
        expectedFolderStructure: 'src/',
        deadline: new Date('2024-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(userRepository.findById).mockResolvedValue(mockTeacher as any)
      vi.mocked(assignmentRepository.create).mockResolvedValue(mockAssignment as any)

      const result = await assignmentService.createAssignment(teacherId, {
        title: 'Test Assignment',
        description: 'Test Description',
        difficulty: 'EASY',
        xpReward: 100,
        requiredFiles: ['main.js'],
        expectedFolderStructure: 'src/',
        deadline: new Date('2024-12-31'),
      })

      expect(result).toEqual(mockAssignment)
      expect(userRepository.findById).toHaveBeenCalledWith(teacherId)
      expect(assignmentRepository.create).toHaveBeenCalled()
    })

    it('should reject if user is not a teacher', async () => {
      const studentId = 'student-123'
      const mockStudent = { id: studentId, role: 'student' }

      vi.mocked(userRepository.findById).mockResolvedValue(mockStudent as any)

      await expect(
        assignmentService.createAssignment(studentId, {
          title: 'Test',
          description: 'Test',
          difficulty: 'EASY',
          xpReward: 100,
          requiredFiles: [],
          deadline: new Date(),
        })
      ).rejects.toThrow('Only teachers can create assignments')
    })
  })

  describe('acceptAssignment', () => {
    it('should create a submission when student accepts assignment', async () => {
      const assignmentId = 'assignment-1'
      const studentId = 'student-123'
      const mockAssignment = {
        id: assignmentId,
        teacherId: 'teacher-123',
        title: 'Test',
        description: 'Test',
        difficulty: 'EASY' as const,
        xpReward: 100,
        requiredFiles: [],
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockSubmission = {
        id: 'submission-1',
        assignmentId,
        studentId,
        status: 'IN_PROGRESS' as const,
        githubRepoUrl: 'https://github.com/user/repo',
        githubBranch: 'main',
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment as any)
      vi.mocked(assignmentSubmissionRepository.findByAssignmentAndStudent).mockResolvedValue(null)
      vi.mocked(assignmentSubmissionRepository.create).mockResolvedValue(mockSubmission as any)

      const result = await assignmentService.acceptAssignment(
        assignmentId,
        studentId,
        'https://github.com/user/repo'
      )

      expect(result).toEqual(mockSubmission)
      expect(assignmentSubmissionRepository.create).toHaveBeenCalled()
    })

    it('should reject if student already accepted assignment', async () => {
      const assignmentId = 'assignment-1'
      const studentId = 'student-123'
      const mockAssignment = {
        id: assignmentId,
        teacherId: 'teacher-123',
        title: 'Test',
        description: 'Test',
        difficulty: 'EASY' as const,
        xpReward: 100,
        requiredFiles: [],
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const existingSubmission = {
        id: 'submission-1',
        assignmentId,
        studentId,
        status: 'IN_PROGRESS' as const,
        githubRepoUrl: 'https://github.com/user/repo',
        githubBranch: 'main',
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment as any)
      vi.mocked(assignmentSubmissionRepository.findByAssignmentAndStudent).mockResolvedValue(
        existingSubmission as any
      )

      await expect(
        assignmentService.acceptAssignment(assignmentId, studentId, 'https://github.com/user/repo')
      ).rejects.toThrow('Student has already accepted this assignment')
    })
  })

  describe('calculateXPReward', () => {
    it('should calculate XP with difficulty multiplier', () => {
      const baseXP = 100

      const easyXP = assignmentService.calculateXPReward(baseXP, 100, 'EASY')
      const mediumXP = assignmentService.calculateXPReward(baseXP, 100, 'MEDIUM')
      const hardXP = assignmentService.calculateXPReward(baseXP, 100, 'HARD')

      expect(easyXP).toBe(100)
      expect(mediumXP).toBe(110)
      expect(hardXP).toBe(120)
    })

    it('should apply score multiplier', () => {
      const baseXP = 100

      const fullScore = assignmentService.calculateXPReward(baseXP, 100, 'EASY')
      const halfScore = assignmentService.calculateXPReward(baseXP, 50, 'EASY')
      const zeroScore = assignmentService.calculateXPReward(baseXP, 0, 'EASY')

      expect(fullScore).toBe(100)
      expect(halfScore).toBe(50)
      expect(zeroScore).toBe(0)
    })

    it('should combine difficulty and score multipliers', () => {
      const baseXP = 100

      const result = assignmentService.calculateXPReward(baseXP, 80, 'HARD')
      // 100 * 1.2 (HARD) * 0.8 (80%) = 96
      expect(result).toBe(96)
    })

    it('should return minimum 1 XP if score > 0', () => {
      const baseXP = 100

      const result = assignmentService.calculateXPReward(baseXP, 1, 'EASY')
      // 100 * 1.0 * 0.01 = 1
      expect(result).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getStudentSubmissions', () => {
    it('should return all submissions for a student', async () => {
      const studentId = 'student-123'
      const mockSubmissions = [
        {
          id: 'submission-1',
          assignmentId: 'assignment-1',
          studentId,
          status: 'IN_PROGRESS' as const,
          githubRepoUrl: 'https://github.com/user/repo1',
          githubBranch: 'main',
          xpEarned: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'submission-2',
          assignmentId: 'assignment-2',
          studentId,
          status: 'PASS' as const,
          githubRepoUrl: 'https://github.com/user/repo2',
          githubBranch: 'main',
          xpEarned: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(assignmentSubmissionRepository.findByStudentId).mockResolvedValue(mockSubmissions as any)

      const result = await assignmentService.getStudentSubmissions(studentId)

      expect(result).toEqual(mockSubmissions)
      expect(assignmentSubmissionRepository.findByStudentId).toHaveBeenCalledWith(studentId)
    })
  })
})
