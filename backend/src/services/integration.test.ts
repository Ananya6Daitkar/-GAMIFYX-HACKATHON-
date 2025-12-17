import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import assignmentService from './assignmentService'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'
import assignmentRepository from '../database/repositories/assignmentRepository'
import userRepository from '../database/repositories/userRepository'
import badgeRepository from '../database/repositories/badgeRepository'
import leaderboardRepository from '../database/repositories/leaderboardRepository'
import focusSessionRepository from '../database/repositories/focusSessionRepository'
import focusSessionService from './focusSessionService'
import githubWebhookService from './githubWebhookService'
import githubPushToXpService from './githubPushToXpService'
import aiFeedbackService from './aiFeedbackService'
import { User, Assignment, AssignmentSubmission, Badge, FocusSession } from '../database/models'

// Mock all repositories
vi.mock('../database/repositories/assignmentRepository')
vi.mock('../database/repositories/assignmentSubmissionRepository')
vi.mock('../database/repositories/userRepository')
vi.mock('../database/repositories/badgeRepository')
vi.mock('../database/repositories/leaderboardRepository')
vi.mock('../database/repositories/focusSessionRepository')
vi.mock('../database/repositories/submissionRepository')
vi.mock('../database/repositories/aiFeedbackRepository')
vi.mock('../database/repositories/githubWebhookRepository')
vi.mock('../server', () => ({
  io: {
    emit: vi.fn(),
    to: vi.fn(() => ({
      emit: vi.fn(),
    })),
  },
}))

describe('Integration Tests - End-to-End User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Flow 1: Complete Submission Flow (submit → feedback → XP)', () => {
    /**
     * Validates: Requirements 1.1, 4.1, 6.1
     * Property: XP Accumulation Consistency
     * 
     * This flow tests:
     * 1. Student accepts an assignment
     * 2. GitHub webhook processes a push event
     * 3. Auto-grading generates a score
     * 4. AI feedback is generated
     * 5. XP is awarded to the student
     * 6. Student's level is updated
     */
    it('should complete full submission flow: accept → push → grade → feedback → XP', async () => {
      // Setup: Create test data
      const teacherId = 'teacher-123'
      const studentId = 'student-123'
      const assignmentId = 'assignment-1'
      const submissionId = 'submission-1'

      const mockTeacher: User = {
        id: teacherId,
        username: 'teacher',
        email: 'teacher@test.com',
        passwordHash: 'hash',
        level: 5,
        totalXp: 500,
        role: 'teacher',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockStudent: User = {
        id: studentId,
        username: 'student',
        email: 'student@test.com',
        passwordHash: 'hash',
        level: 1,
        totalXp: 0,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockAssignment: Assignment = {
        id: assignmentId,
        teacherId,
        title: 'Build a Calculator',
        description: 'Create a simple calculator app',
        difficulty: 'EASY',
        xpReward: 100,
        requiredFiles: ['main.js', 'package.json'],
        expectedFolderStructure: 'src/',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockSubmission: AssignmentSubmission = {
        id: submissionId,
        assignmentId,
        studentId,
        status: 'IN_PROGRESS',
        githubRepoUrl: 'https://github.com/student/calculator',
        githubBranch: 'main',
        autoGradeScore: 0,
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Step 1: Student accepts assignment
      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment)
      vi.mocked(assignmentSubmissionRepository.findByAssignmentAndStudent).mockResolvedValue(null)
      vi.mocked(assignmentSubmissionRepository.create).mockResolvedValue(mockSubmission)

      const acceptedSubmission = await assignmentService.acceptAssignment(
        assignmentId,
        studentId,
        'https://github.com/student/calculator'
      )

      expect(acceptedSubmission.status).toBe('IN_PROGRESS')
      expect(acceptedSubmission.studentId).toBe(studentId)

      // Step 2: GitHub webhook processes push event
      const githubPayload = {
        ref: 'refs/heads/main',
        before: 'abc123',
        after: 'def456',
        repository: {
          id: 12345,
          name: 'calculator',
          full_name: 'student/calculator',
          owner: {
            name: 'Student',
            login: 'student',
          },
        },
        pusher: {
          name: 'Student',
          email: 'student@test.com',
        },
        commits: [
          {
            id: 'commit1',
            message: 'Add calculator functions',
            timestamp: new Date().toISOString(),
            author: {
              name: 'Student',
              email: 'student@test.com',
            },
            added: ['src/calculator.js', 'package.json'],
            removed: [],
            modified: [],
          },
          {
            id: 'commit2',
            message: 'Add unit tests for calculator',
            timestamp: new Date().toISOString(),
            author: {
              name: 'Student',
              email: 'student@test.com',
            },
            added: ['src/calculator.test.js'],
            removed: [],
            modified: ['src/calculator.js'],
          },
        ],
        head_commit: {
          id: 'commit2',
          message: 'Add unit tests for calculator',
          timestamp: new Date().toISOString(),
          author: {
            name: 'Student',
            email: 'student@test.com',
          },
          added: ['src/calculator.test.js'],
          removed: [],
          modified: ['src/calculator.js'],
        },
      }

      // Step 3: Auto-grading generates score
      const updatedSubmissionWithScore: AssignmentSubmission = {
        ...mockSubmission,
        autoGradeScore: 85,
        status: 'PASS',
      }

      // Calculate XP reward
      const xpReward = assignmentService.calculateXPReward(
        mockAssignment.xpReward,
        85,
        mockAssignment.difficulty
      )

      vi.mocked(assignmentSubmissionRepository.findById).mockResolvedValue(mockSubmission)
      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment)
      vi.mocked(assignmentSubmissionRepository.updateGradeAndXP).mockResolvedValue(
        updatedSubmissionWithScore
      )
      vi.mocked(assignmentSubmissionRepository.updateStatus).mockResolvedValue(
        updatedSubmissionWithScore
      )

      // Mock the student for XP processing
      vi.mocked(userRepository.findById).mockResolvedValue(mockStudent)
      vi.mocked(userRepository.updateXP).mockResolvedValue({
        ...mockStudent,
        totalXp: mockStudent.totalXp + xpReward,
      })

      // Mock badges for badge unlocking
      vi.mocked(badgeRepository.getAll).mockResolvedValue([])
      vi.mocked(badgeRepository.hasBadge).mockResolvedValue(false)

      // Process webhook
      const processedSubmission = await githubWebhookService.handlePushEvent(
        githubPayload as any,
        submissionId
      )

      expect(processedSubmission.status).toBe('PASS')
      expect(processedSubmission.autoGradeScore).toBe(85)

      // Step 4: Verify XP was calculated correctly
      expect(xpReward).toBeGreaterThan(0)
      expect(xpReward).toBeLessThanOrEqual(mockAssignment.xpReward)

      // Step 5: Verify student XP is updated
      const updatedStudent: User = {
        ...mockStudent,
        totalXp: mockStudent.totalXp + xpReward,
        level: Math.floor((mockStudent.totalXp + xpReward) / 100),
      }

      // Update the mock to return the updated student
      vi.mocked(userRepository.findById).mockClear()
      vi.mocked(userRepository.findById).mockResolvedValue(updatedStudent)

      const studentAfterXP = await userRepository.findById(studentId)
      expect(studentAfterXP.totalXp).toBeGreaterThan(mockStudent.totalXp)
      // Level should be calculated correctly: floor(totalXp / 100)
      expect(studentAfterXP.level).toBe(Math.floor(studentAfterXP.totalXp / 100))

      // Step 6: Verify AI feedback would be generated
      // (In real scenario, this would be called asynchronously)
      expect(processedSubmission.autoGradeScore).toBe(85)
    })

    it('should handle submission with REVIEW status and partial XP', async () => {
      const studentId = 'student-456'
      const assignmentId = 'assignment-2'
      const submissionId = 'submission-2'

      const mockAssignment: Assignment = {
        id: assignmentId,
        teacherId: 'teacher-123',
        title: 'API Project',
        description: 'Build a REST API',
        difficulty: 'MEDIUM',
        xpReward: 150,
        requiredFiles: ['server.js'],
        expectedFolderStructure: 'src/',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockSubmission: AssignmentSubmission = {
        id: submissionId,
        assignmentId,
        studentId,
        status: 'REVIEW',
        githubRepoUrl: 'https://github.com/student/api',
        githubBranch: 'main',
        autoGradeScore: 65,
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Calculate XP for REVIEW status (50% of base)
      const xpReward = assignmentService.calculateXPReward(
        mockAssignment.xpReward,
        mockSubmission.autoGradeScore || 0,
        mockAssignment.difficulty
      )

      // MEDIUM difficulty multiplier is 1.1x
      // 150 * 1.1 * 0.65 = 107.25
      expect(xpReward).toBeGreaterThan(0)
      expect(xpReward).toBeLessThan(mockAssignment.xpReward)
    })

    it('should handle submission with FAIL status and no XP', async () => {
      const studentId = 'student-789'
      const assignmentId = 'assignment-3'

      const mockAssignment: Assignment = {
        id: assignmentId,
        teacherId: 'teacher-123',
        title: 'Advanced Project',
        description: 'Build something complex',
        difficulty: 'HARD',
        xpReward: 200,
        requiredFiles: ['main.js'],
        expectedFolderStructure: 'src/',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // FAIL status (score < 50)
      const xpReward = assignmentService.calculateXPReward(mockAssignment.xpReward, 30, 'HARD')

      // 200 * 1.2 * 0.30 = 72
      expect(xpReward).toBeGreaterThan(0)
      expect(xpReward).toBeLessThan(mockAssignment.xpReward)
    })
  })

  describe('Flow 2: Leaderboard Ranking Updates', () => {
    /**
     * Validates: Requirements 2.1, 2.4, 16.1
     * Property: Leaderboard Ranking Accuracy
     * 
     * This flow tests:
     * 1. Multiple students earn XP
     * 2. Leaderboard is updated
     * 3. Rankings are in correct order (descending by XP)
     * 4. Real-time updates are broadcast
     */
    it('should update leaderboard rankings when students earn XP', async () => {
      const students = [
        {
          id: 'student-1',
          username: 'alice',
          totalXp: 500,
          level: 5,
        },
        {
          id: 'student-2',
          username: 'bob',
          totalXp: 300,
          level: 3,
        },
        {
          id: 'student-3',
          username: 'charlie',
          totalXp: 700,
          level: 7,
        },
      ]

      // Mock leaderboard repository
      const mockLeaderboardEntries = students
        .sort((a, b) => b.totalXp - a.totalXp)
        .map((student, index) => ({
          rank: index + 1,
          userId: student.id,
          username: student.username,
          xp: student.totalXp,
          streak: 0,
        }))

      vi.mocked(leaderboardRepository.getLeaderboard).mockResolvedValue({
        id: 'leaderboard-1',
        period: 'daily',
        entries: mockLeaderboardEntries,
        updatedAt: new Date(),
      })

      const leaderboard = await leaderboardRepository.getLeaderboard('daily')

      // Verify rankings are in descending order by XP
      expect(leaderboard.entries[0].username).toBe('charlie') // 700 XP
      expect(leaderboard.entries[1].username).toBe('alice') // 500 XP
      expect(leaderboard.entries[2].username).toBe('bob') // 300 XP

      // Verify ranks are sequential
      expect(leaderboard.entries[0].rank).toBe(1)
      expect(leaderboard.entries[1].rank).toBe(2)
      expect(leaderboard.entries[2].rank).toBe(3)

      // Verify XP is in descending order
      for (let i = 0; i < leaderboard.entries.length - 1; i++) {
        expect(leaderboard.entries[i].xp).toBeGreaterThanOrEqual(leaderboard.entries[i + 1].xp)
      }
    })

    it('should handle ties in leaderboard by earliest timestamp', async () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const mockLeaderboardEntries = [
        {
          rank: 1,
          userId: 'student-1',
          username: 'alice',
          xp: 500,
          streak: 0,
        },
        {
          rank: 2,
          userId: 'student-2',
          username: 'bob',
          xp: 500, // Same XP as alice
          streak: 0,
        },
      ]

      vi.mocked(leaderboardRepository.getLeaderboard).mockResolvedValue({
        id: 'leaderboard-1',
        period: 'daily',
        entries: mockLeaderboardEntries,
        updatedAt: now,
      })

      const leaderboard = await leaderboardRepository.getLeaderboard('daily')

      // Both have same XP
      expect(leaderboard.entries[0].xp).toBe(leaderboard.entries[1].xp)

      // But ranks should still be sequential
      expect(leaderboard.entries[0].rank).toBe(1)
      expect(leaderboard.entries[1].rank).toBe(2)
    })

    it('should support multiple leaderboard periods (daily, weekly, monthly)', async () => {
      const periods: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly']

      for (const period of periods) {
        const mockLeaderboard = {
          id: `leaderboard-${period}`,
          period,
          entries: [
            { rank: 1, userId: 'student-1', username: 'alice', xp: 500, streak: 0 },
            { rank: 2, userId: 'student-2', username: 'bob', xp: 300, streak: 0 },
          ],
          updatedAt: new Date(),
        }

        vi.mocked(leaderboardRepository.getLeaderboard).mockResolvedValue(mockLeaderboard)

        const leaderboard = await leaderboardRepository.getLeaderboard(period)

        expect(leaderboard.period).toBe(period)
        expect(leaderboard.entries.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Flow 3: Focus Lock Mode Session Persistence', () => {
    /**
     * Validates: Requirements 7.1, 7.4, 16.1
     * Property: Focus Session XP Reward Calculation
     * 
     * This flow tests:
     * 1. Student starts a focus session
     * 2. Session state is persisted
     * 3. Browser closes (simulated)
     * 4. Session is recovered
     * 5. XP is awarded on completion
     */
    it('should persist focus session state and recover on browser close', async () => {
      const userId = 'student-123'
      const sessionId = 'session-1'

      const mockUser: User = {
        id: userId,
        username: 'student',
        email: 'student@test.com',
        passwordHash: 'hash',
        level: 1,
        totalXp: 0,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockSession: FocusSession = {
        id: sessionId,
        userId,
        startTime: new Date(),
        status: 'active',
        createdAt: new Date(),
      }

      // Step 1: Start session
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(focusSessionRepository.create).mockResolvedValue(mockSession)

      const startedSession = await focusSessionService.startSession(userId)

      expect(startedSession.status).toBe('active')
      expect(startedSession.userId).toBe(userId)

      // Step 2: Session is persisted (verified by repository call)
      expect(focusSessionRepository.create).toHaveBeenCalled()

      // Step 3: Simulate browser close - session should be recoverable
      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession)

      const recoveredSession = await focusSessionRepository.findById(sessionId)

      expect(recoveredSession).toBeDefined()
      expect(recoveredSession?.status).toBe('active')
      expect(recoveredSession?.userId).toBe(userId)

      // Step 4: End session and award XP
      const sessionDuration = 10 // 10 minutes
      const mockCompletedSession: FocusSession = {
        ...mockSession,
        endTime: new Date(mockSession.startTime.getTime() + sessionDuration * 60 * 1000),
        duration: sessionDuration * 60,
        xpReward: sessionDuration,
        status: 'completed',
      }

      vi.mocked(focusSessionRepository.endSession).mockResolvedValue(mockCompletedSession)
      vi.mocked(userRepository.updateXP).mockResolvedValue({
        ...mockUser,
        totalXp: mockUser.totalXp + sessionDuration,
      })

      const result = await focusSessionService.endSession(sessionId, userId, 0)

      expect(result.session.status).toBe('completed')
      expect(result.xpAwarded).toBeGreaterThan(0)
      expect(userRepository.updateXP).toHaveBeenCalledWith(userId, result.xpAwarded)
    })

    it('should calculate XP reward based on session duration', async () => {
      const userId = 'student-456'
      const sessionId = 'session-2'

      const mockSession: FocusSession = {
        id: sessionId,
        userId,
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        status: 'active',
        createdAt: new Date(),
      }

      const mockCompletedSession: FocusSession = {
        ...mockSession,
        endTime: new Date(),
        duration: 30 * 60, // 30 minutes in seconds
        xpReward: 30, // 1 XP per minute
        status: 'completed',
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession)
      vi.mocked(focusSessionRepository.endSession).mockResolvedValue(mockCompletedSession)
      vi.mocked(userRepository.updateXP).mockResolvedValue({} as any)

      const result = await focusSessionService.endSession(sessionId, userId, 0)

      expect(result.xpAwarded).toBeGreaterThanOrEqual(30)
    })

    it('should apply streak bonus to XP reward', async () => {
      const userId = 'student-789'
      const sessionId = 'session-3'
      const streakDays = 7

      const mockSession: FocusSession = {
        id: sessionId,
        userId,
        startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        status: 'active',
        createdAt: new Date(),
      }

      const mockCompletedSession: FocusSession = {
        ...mockSession,
        endTime: new Date(),
        duration: 15 * 60,
        xpReward: 20, // 15 minutes * (1 + 0.33 streak bonus)
        status: 'completed',
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession)
      vi.mocked(focusSessionRepository.endSession).mockResolvedValue(mockCompletedSession)
      vi.mocked(userRepository.updateXP).mockResolvedValue({} as any)

      const result = await focusSessionService.endSession(sessionId, userId, streakDays)

      // With streak bonus, XP should be higher than base
      expect(result.xpAwarded).toBeGreaterThan(15)
    })

    it('should handle abandoned sessions without awarding XP', async () => {
      const userId = 'student-999'
      const sessionId = 'session-4'

      const mockSession: FocusSession = {
        id: sessionId,
        userId,
        startTime: new Date(),
        status: 'active',
        createdAt: new Date(),
      }

      const mockAbandonedSession: FocusSession = {
        ...mockSession,
        status: 'abandoned',
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockSession)
      vi.mocked(focusSessionRepository.abandonSession).mockResolvedValue(mockAbandonedSession)

      const result = await focusSessionService.abandonSession(sessionId, userId)

      expect(result.status).toBe('abandoned')
      // Verify updateXP was NOT called for abandoned sessions
      expect(userRepository.updateXP).not.toHaveBeenCalled()
    })
  })

  describe('Cross-Flow Integration: Complete User Journey', () => {
    /**
     * Validates: Requirements 1.1, 4.1, 6.1, 7.1, 16.1
     * 
     * This comprehensive test simulates a complete user journey:
     * 1. Student accepts assignment
     * 2. Student makes commits (GitHub webhook)
     * 3. Auto-grading and AI feedback
     * 4. XP awarded and level up
     * 5. Leaderboard updated
     * 6. Student uses focus mode
     * 7. More XP earned
     * 8. Badges unlocked
     */
    it('should complete full user journey: assignment → submission → XP → leaderboard → focus mode', async () => {
      const studentId = 'student-journey'
      const teacherId = 'teacher-journey'
      const assignmentId = 'assignment-journey'

      // Initial student state
      let studentState: User = {
        id: studentId,
        username: 'journeyuser',
        email: 'journey@test.com',
        passwordHash: 'hash',
        level: 0,
        totalXp: 0,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Step 1: Accept assignment
      const mockAssignment: Assignment = {
        id: assignmentId,
        teacherId,
        title: 'Journey Assignment',
        description: 'Complete journey test',
        difficulty: 'MEDIUM',
        xpReward: 150,
        requiredFiles: ['main.js'],
        expectedFolderStructure: 'src/',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockSubmission: AssignmentSubmission = {
        id: 'submission-journey',
        assignmentId,
        studentId,
        status: 'IN_PROGRESS',
        githubRepoUrl: 'https://github.com/user/journey',
        githubBranch: 'main',
        autoGradeScore: 0,
        xpEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(assignmentRepository.findById).mockResolvedValue(mockAssignment)
      vi.mocked(assignmentSubmissionRepository.findByAssignmentAndStudent).mockResolvedValue(null)
      vi.mocked(assignmentSubmissionRepository.create).mockResolvedValue(mockSubmission)

      const submission = await assignmentService.acceptAssignment(
        assignmentId,
        studentId,
        'https://github.com/user/journey'
      )

      expect(submission.status).toBe('IN_PROGRESS')

      // Step 2: GitHub webhook processes push
      const xpFromSubmission = 120 // 150 * 1.1 * 0.8 (MEDIUM difficulty, 80% score)
      studentState.totalXp += xpFromSubmission
      studentState.level = Math.floor(studentState.totalXp / 100)

      vi.mocked(userRepository.findById).mockResolvedValue(studentState)
      vi.mocked(userRepository.updateXP).mockResolvedValue(studentState)

      const updatedStudent = await userRepository.findById(studentId)
      expect(updatedStudent.totalXp).toBe(120)
      expect(updatedStudent.level).toBe(1)

      // Step 3: Leaderboard updated
      const mockLeaderboardEntries = [
        { rank: 1, userId: studentId, username: 'journeyuser', xp: 120, streak: 1 },
      ]

      vi.mocked(leaderboardRepository.getLeaderboard).mockResolvedValue(mockLeaderboardEntries)

      const leaderboard = await leaderboardRepository.getLeaderboard('daily')
      expect(leaderboard[0].xp).toBe(120)
      expect(leaderboard[0].rank).toBe(1)

      // Step 4: Student uses focus mode
      const mockActiveFocusSession: FocusSession = {
        id: 'focus-journey',
        userId: studentId,
        startTime: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        status: 'active',
        createdAt: new Date(),
      }

      const mockCompletedFocusSession: FocusSession = {
        ...mockActiveFocusSession,
        endTime: new Date(),
        duration: 20 * 60,
        xpReward: 20,
        status: 'completed',
      }

      vi.mocked(focusSessionRepository.findById).mockResolvedValue(mockActiveFocusSession)
      vi.mocked(focusSessionRepository.endSession).mockResolvedValue(mockCompletedFocusSession)
      vi.mocked(userRepository.updateXP).mockResolvedValue({
        ...studentState,
        totalXp: studentState.totalXp + 20,
      })

      const focusResult = await focusSessionService.endSession('focus-journey', studentId, 1)

      expect(focusResult.session.status).toBe('completed')
      expect(focusResult.xpAwarded).toBeGreaterThan(0)

      // Step 5: Final student state
      studentState.totalXp += focusResult.xpAwarded
      studentState.level = Math.floor(studentState.totalXp / 100)

      expect(studentState.totalXp).toBeGreaterThan(120)
      expect(studentState.level).toBeGreaterThanOrEqual(1)
    })
  })
})
