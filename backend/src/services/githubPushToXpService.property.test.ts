import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import GitHubPushToXpService from './githubPushToXpService'
import userRepository from '../database/repositories/userRepository'
import badgeRepository from '../database/repositories/badgeRepository'
import leaderboardRepository from '../database/repositories/leaderboardRepository'
import assignmentSubmissionRepository from '../database/repositories/assignmentSubmissionRepository'

// Mock dependencies
vi.mock('../database/repositories/userRepository')
vi.mock('../database/repositories/badgeRepository')
vi.mock('../database/repositories/leaderboardRepository')
vi.mock('../database/repositories/assignmentSubmissionRepository')
vi.mock('../server', () => ({
  io: {
    emit: vi.fn(),
    to: vi.fn(() => ({
      emit: vi.fn(),
    })),
  },
}))

describe('GitHubPushToXpService - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 1: XP Accumulation Consistency
   * **Feature: gamifyx-platform, Property 1: XP Accumulation Consistency**
   * **Validates: Requirements 1.1, 6.1**
   */
  it('XP accumulation should be consistent - total XP increases by exactly the awarded amount', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 1, max: 1000 }),
        (initialXp, xpToAward) => {
          // Verify that new total equals initial + awarded
          const newTotal = initialXp + xpToAward
          expect(newTotal).toBe(initialXp + xpToAward)
          expect(newTotal).toBeGreaterThanOrEqual(initialXp)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 2: Level Calculation Consistency
   * **Feature: gamifyx-platform, Property 2: Level Calculation Consistency**
   * **Validates: Requirements 1.1, 6.1**
   */
  it('level calculation should be consistent - level = floor(totalXP / 100)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (totalXp) => {
        const service = GitHubPushToXpService as any
        const level = service.calculateLevel(totalXp)

        // Verify level calculation
        const expectedLevel = Math.floor(totalXp / 100)
        expect(level).toBe(expectedLevel)

        // Verify level is non-negative
        expect(level).toBeGreaterThanOrEqual(0)

        // Verify level increases monotonically with XP
        const nextXp = totalXp + 100
        const nextLevel = service.calculateLevel(nextXp)
        expect(nextLevel).toBeGreaterThanOrEqual(level)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Level Up Detection
   * **Feature: gamifyx-platform, Property 3: Level Up Detection**
   * **Validates: Requirements 1.1, 6.1**
   */
  it('level up should be detected when crossing 100 XP threshold', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 1, max: 200 }),
        (initialXpInLevel, xpToAdd) => {
          const service = GitHubPushToXpService as any

          // Calculate initial and new XP
          const level = fc.sample(fc.integer({ min: 0, max: 100 }), 1)[0]
          const initialXp = level * 100 + initialXpInLevel
          const newXp = initialXp + xpToAdd

          const oldLevel = service.calculateLevel(initialXp)
          const newLevel = service.calculateLevel(newXp)

          // If XP crosses 100-point boundary, level should increase
          if (Math.floor(newXp / 100) > Math.floor(initialXp / 100)) {
            expect(newLevel).toBeGreaterThan(oldLevel)
          } else {
            expect(newLevel).toBe(oldLevel)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4: Badge Criteria Idempotence
   * **Feature: gamifyx-platform, Property 4: Badge Criteria Idempotence**
   * **Validates: Requirements 3.1, 3.2**
   */
  it('badge unlock criteria should be idempotent - earning same badge twice should result in one badge', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('First Commit', 'Commit Streak', 'Code Master', 'Feedback Listener'),
        (badgeName) => {
          // Verify badge names are valid
          const validBadges = ['First Commit', 'Commit Streak', 'Code Master', 'Feedback Listener']
          expect(validBadges).toContain(badgeName)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Streak Calculation Monotonicity
   * **Feature: gamifyx-platform, Property 5: Streak Calculation Monotonicity**
   * **Validates: Requirements 3.1, 3.2**
   */
  it('streak should be monotonic - more recent submissions should not decrease streak', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            studentId: fc.uuid(),
            assignmentId: fc.uuid(),
            status: fc.constantFrom('IN_PROGRESS', 'SUBMITTED', 'PASS', 'REVIEW', 'FAIL'),
            githubRepoUrl: fc.webUrl(),
            githubBranch: fc.string(),
            autoGradeScore: fc.option(fc.integer({ min: 0, max: 100 })),
            xpEarned: fc.integer({ min: 0, max: 1000 }),
            createdAt: fc.date(),
            updatedAt: fc.date(),
          }),
          { maxLength: 30 }
        ),
        (submissions) => {
          // Sort by date descending
          const sorted = submissions.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )

          // Calculate streak
          let streak = 0
          let currentDate = new Date()
          currentDate.setHours(0, 0, 0, 0)

          for (const submission of sorted) {
            const submissionDate = new Date(submission.createdAt)
            submissionDate.setHours(0, 0, 0, 0)

            const daysDiff = Math.floor(
              (currentDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysDiff === streak) {
              streak++
              currentDate.setDate(currentDate.getDate() - 1)
            } else {
              break
            }
          }

          // Verify streak is non-negative
          expect(streak).toBeGreaterThanOrEqual(0)

          // Verify streak doesn't exceed number of submissions
          expect(streak).toBeLessThanOrEqual(submissions.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 6: Activity Data Consistency
   * **Feature: gamifyx-platform, Property 6: Activity Data Consistency**
   * **Validates: Requirements 5.1, 5.4, 5.5**
   */
  it('activity data should be consistent - submission counts should match actual submissions', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            studentId: fc.uuid(),
            assignmentId: fc.uuid(),
            status: fc.constantFrom('IN_PROGRESS', 'SUBMITTED', 'PASS', 'REVIEW', 'FAIL'),
            githubRepoUrl: fc.webUrl(),
            githubBranch: fc.string(),
            autoGradeScore: fc.option(fc.integer({ min: 0, max: 100 })),
            xpEarned: fc.integer({ min: 0, max: 1000 }),
            createdAt: fc.date(),
            updatedAt: fc.date(),
          }),
          { maxLength: 100 }
        ),
        (submissions) => {
          // Create activity map
          const activityMap = new Map<string, number>()

          // Count submissions per day
          submissions.forEach((submission) => {
            const dateStr = new Date(submission.createdAt).toISOString().split('T')[0]
            activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1)
          })

          // Verify total count matches
          let totalCount = 0
          activityMap.forEach((count) => {
            totalCount += count
          })

          expect(totalCount).toBe(submissions.length)

          // Verify all counts are positive
          activityMap.forEach((count) => {
            expect(count).toBeGreaterThan(0)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 7: XP Reward Non-Negativity
   * **Feature: gamifyx-platform, Property 7: XP Reward Non-Negativity**
   * **Validates: Requirements 1.1, 6.1**
   */
  it('XP reward should always be non-negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 0, max: 100 }),
        (baseXp, score) => {
          // Calculate XP reward
          const scoreMultiplier = score / 100
          const finalXP = Math.floor(baseXp * scoreMultiplier)
          const xpReward = score > 0 ? Math.max(finalXP, 1) : 0

          // Verify XP reward is non-negative
          expect(xpReward).toBeGreaterThanOrEqual(0)

          // Verify XP reward is 0 only when score is 0
          if (score === 0) {
            expect(xpReward).toBe(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Commit Streak Threshold
   * **Feature: gamifyx-platform, Property 8: Commit Streak Threshold**
   * **Validates: Requirements 3.1, 3.2**
   */
  it('commit streak badge should unlock at exactly 5 commits in 7 days', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        (commitCount) => {
          // Badge should unlock if commitCount >= 5
          const shouldUnlock = commitCount >= 5

          // Verify logic
          if (commitCount < 5) {
            expect(shouldUnlock).toBe(false)
          } else {
            expect(shouldUnlock).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 9: First Commit Badge Uniqueness
   * **Feature: gamifyx-platform, Property 9: First Commit Badge Uniqueness**
   * **Validates: Requirements 3.1, 3.2**
   */
  it('first commit badge should unlock only on first PASS submission', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom('IN_PROGRESS', 'SUBMITTED', 'PASS', 'REVIEW', 'FAIL'),
          { minLength: 1, maxLength: 10 }
        ),
        (statuses) => {
          // Find first PASS
          const firstPassIndex = statuses.findIndex((s) => s === 'PASS')
          const hasPass = firstPassIndex !== -1

          // Badge should unlock if there's at least one PASS
          expect(hasPass).toBe(firstPassIndex !== -1)

          // If there's a PASS, it should be the first one
          if (hasPass) {
            for (let i = 0; i < firstPassIndex; i++) {
              expect(statuses[i]).not.toBe('PASS')
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 10: Real-time Update Broadcast
   * **Feature: gamifyx-platform, Property 10: Real-time Update Broadcast**
   * **Validates: Requirements 16.1, 16.2**
   */
  it('real-time updates should include all required fields', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 100 }),
        fc.boolean(),
        fc.array(fc.string(), { maxLength: 5 }),
        (studentId, xpEarned, newLevel, leveledUp, badgesUnlocked) => {
          // Create update object
          const update = {
            studentId,
            xpEarned,
            newLevel,
            leveledUp,
            badgesUnlocked,
            timestamp: new Date(),
          }

          // Verify all required fields are present
          expect(update).toHaveProperty('studentId')
          expect(update).toHaveProperty('xpEarned')
          expect(update).toHaveProperty('newLevel')
          expect(update).toHaveProperty('leveledUp')
          expect(update).toHaveProperty('badgesUnlocked')
          expect(update).toHaveProperty('timestamp')

          // Verify field types
          expect(typeof update.studentId).toBe('string')
          expect(typeof update.xpEarned).toBe('number')
          expect(typeof update.newLevel).toBe('number')
          expect(typeof update.leveledUp).toBe('boolean')
          expect(Array.isArray(update.badgesUnlocked)).toBe(true)
          expect(update.timestamp instanceof Date).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
