import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TeacherService } from './teacherService'
import pool from '../database/connection'

// Mock the database pool
vi.mock('../database/connection', () => ({
  default: {
    query: vi.fn(),
  },
}))

// Type the mock properly
const mockQuery = pool.query as any

describe('TeacherService', () => {
  let service: TeacherService

  beforeEach(() => {
    service = new TeacherService()
    vi.clearAllMocks()
  })

  describe('getClassOverview', () => {
    it('should return class overview with students and statistics', async () => {
      const mockStudents = [
        { id: '1', username: 'student1', email: 'student1@test.com', level: 5, total_xp: 500, avatar: null, created_at: new Date() },
        { id: '2', username: 'student2', email: 'student2@test.com', level: 3, total_xp: 300, avatar: null, created_at: new Date() },
        { id: '3', username: 'student3', email: 'student3@test.com', level: 4, total_xp: 400, avatar: null, created_at: new Date() },
      ]

      mockQuery.mockResolvedValue({ rows: mockStudents })

      const result = await service.getClassOverview('teacher-123')

      expect(result.totalStudents).toBe(3)
      expect(result.averageXp).toBe(400) // (500 + 300 + 400) / 3
      expect(result.classLeaderboard).toHaveLength(3)
      expect(result.classLeaderboard[0].username).toBe('student1')
      expect(result.classLeaderboard[0].rank).toBe(1)
    })

    it('should handle empty student list', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      const result = await service.getClassOverview('teacher-123')

      expect(result.totalStudents).toBe(0)
      expect(result.averageXp).toBe(0)
      expect(result.classLeaderboard).toHaveLength(0)
    })
  })

  describe('getStudentList', () => {
    it('should return student list with intervention indicators', async () => {
      const mockStudents = [
        { id: '1', username: 'student1', email: 'student1@test.com', level: 5, total_xp: 500, avatar: null, created_at: new Date() },
        { id: '2', username: 'student2', email: 'student2@test.com', level: 1, total_xp: 50, avatar: null, created_at: new Date() },
        { id: '3', username: 'student3', email: 'student3@test.com', level: 2, total_xp: 100, avatar: null, created_at: new Date() },
        { id: '4', username: 'student4', email: 'student4@test.com', level: 3, total_xp: 200, avatar: null, created_at: new Date() },
        { id: '5', username: 'student5', email: 'student5@test.com', level: 4, total_xp: 300, avatar: null, created_at: new Date() },
        { id: '6', username: 'student6', email: 'student6@test.com', level: 1, total_xp: 25, avatar: null, created_at: new Date() },
        { id: '7', username: 'student7', email: 'student7@test.com', level: 2, total_xp: 75, avatar: null, created_at: new Date() },
        { id: '8', username: 'student8', email: 'student8@test.com', level: 3, total_xp: 150, avatar: null, created_at: new Date() },
        { id: '9', username: 'student9', email: 'student9@test.com', level: 4, total_xp: 250, avatar: null, created_at: new Date() },
        { id: '10', username: 'student10', email: 'student10@test.com', level: 5, total_xp: 400, avatar: null, created_at: new Date() },
      ]

      mockQuery.mockResolvedValue({ rows: mockStudents })

      const result = await service.getStudentList('teacher-123')

      expect(result).toHaveLength(10)
      expect(result[0].username).toBe('student1')
      expect(result[0].needsIntervention).toBe(false)
      // Student with lowest XP should need intervention
      const lowestXpStudent = result.find(s => s.totalXp === 25)
      expect(lowestXpStudent?.needsIntervention).toBe(true)
    })

    it('should calculate progress percentage correctly', async () => {
      const mockStudents = [
        { id: '1', username: 'student1', email: 'student1@test.com', level: 5, total_xp: 500, avatar: null, created_at: new Date() },
      ]

      mockQuery.mockResolvedValue({ rows: mockStudents })

      const result = await service.getStudentList('teacher-123')

      expect(result[0].progressPercentage).toBeGreaterThan(0)
      expect(result[0].progressPercentage).toBeLessThanOrEqual(100)
    })
  })

  describe('getStudentDetail', () => {
    it('should return student detail with submissions and analytics', async () => {
      const mockStudent = {
        id: 'student-123',
        username: 'student1',
        email: 'student1@test.com',
        level: 5,
        total_xp: 500,
        avatar: null,
        created_at: new Date(),
      }

      const mockSubmissions = [
        { id: 'sub-1', code: 'console.log("hello")', language: 'javascript', status: 'approved', created_at: new Date(), updated_at: new Date() },
      ]

      const mockAnalytics = [
        { date: new Date(), submission_count: 1, language: 'javascript' },
      ]

      const mockSkills = [
        { language: 'javascript', count: 5 },
      ]

      mockQuery
        .mockResolvedValueOnce({ rows: [mockStudent] })
        .mockResolvedValueOnce({ rows: mockSubmissions })
        .mockResolvedValueOnce({ rows: mockAnalytics })
        .mockResolvedValueOnce({ rows: mockSkills })

      const result = await service.getStudentDetail('student-123')

      expect(result.student.username).toBe('student1')
      expect(result.submissions).toHaveLength(1)
      expect(result.analytics.skillDistribution).toHaveLength(1)
    })

    it('should throw error if student not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      await expect(service.getStudentDetail('nonexistent')).rejects.toThrow('Student not found')
    })
  })

  describe('reviewSubmission', () => {
    it('should update submission status to approved', async () => {
      const mockUpdatedSubmission = {
        id: 'sub-123',
        studentId: 'student-123',
        code: 'console.log("hello")',
        language: 'javascript',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockQuery.mockResolvedValue({ rows: [mockUpdatedSubmission] })

      const result = await service.reviewSubmission('sub-123', 'approved', 'Great work!')

      expect(result.status).toBe('approved')
    })

    it('should update submission status to revision_needed', async () => {
      const mockUpdatedSubmission = {
        id: 'sub-123',
        studentId: 'student-123',
        code: 'console.log("hello")',
        language: 'javascript',
        status: 'revision_needed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockQuery.mockResolvedValue({ rows: [mockUpdatedSubmission] })

      const result = await service.reviewSubmission('sub-123', 'revision_needed', 'Please fix the issues')

      expect(result.status).toBe('revision_needed')
    })

    it('should throw error if submission not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      await expect(service.reviewSubmission('nonexistent', 'approved')).rejects.toThrow('Submission not found')
    })
  })

  describe('getAssignmentSubmissions', () => {
    it('should return assignment submissions with student info', async () => {
      const mockSubmissions = [
        {
          id: 'asub-1',
          assignment_id: 'assign-1',
          student_id: 'student-1',
          status: 'PASS',
          auto_grade_score: 85,
          xp_earned: 100,
          created_at: new Date(),
          updated_at: new Date(),
          username: 'student1',
          avatar: null,
        },
      ]

      mockQuery.mockResolvedValue({ rows: mockSubmissions })

      const result = await service.getAssignmentSubmissions('assign-1')

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('PASS')
      expect(result[0].username).toBe('student1')
    })
  })

  describe('updateAssignmentSubmission', () => {
    it('should update assignment submission status', async () => {
      const mockUpdatedSubmission = {
        id: 'asub-1',
        assignment_id: 'assign-1',
        student_id: 'student-1',
        status: 'PASS',
        auto_grade_score: 85,
        xp_earned: 100,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockQuery.mockResolvedValue({ rows: [mockUpdatedSubmission] })

      const result = await service.updateAssignmentSubmission('asub-1', 'PASS')

      expect(result.status).toBe('PASS')
    })

    it('should throw error if submission not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      await expect(service.updateAssignmentSubmission('nonexistent', 'PASS')).rejects.toThrow('Assignment submission not found')
    })
  })
})
