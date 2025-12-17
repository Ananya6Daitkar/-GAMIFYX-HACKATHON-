import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import focusSessionService from './focusSessionService'

describe('FocusSessionService - Property-Based Tests', () => {
  /**
   * Property 6: Focus Session XP Reward Calculation
   * **Feature: gamifyx-platform, Property 6: Focus Session XP Reward Calculation**
   * 
   * For any completed focus session, the XP reward should equal 
   * (session duration in minutes × base rate) + (streak bonus if applicable), 
   * and should be awarded exactly once.
   * 
   * **Validates: Requirements 7.4**
   */
  it('should calculate XP reward correctly for any duration and streak', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1440 }), // 0 to 1440 minutes (24 hours)
        fc.integer({ min: 0, max: 365 }), // 0 to 365 days streak
        (durationMinutes, streakDays) => {
          const xpReward = focusSessionService.calculateXPReward(durationMinutes, streakDays)

          // XP should always be a positive integer
          expect(xpReward).toBeGreaterThanOrEqual(5)
          expect(Number.isInteger(xpReward)).toBe(true)

          // XP should be at least the duration in minutes (base rate)
          if (durationMinutes > 0) {
            expect(xpReward).toBeGreaterThanOrEqual(durationMinutes)
          }

          // XP should not exceed base * 1.5 (max 50% streak bonus)
          const maxPossibleXP = Math.floor(durationMinutes * 1.5)
          expect(xpReward).toBeLessThanOrEqual(Math.max(maxPossibleXP, 5))
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: XP increases with duration
   * For any two durations where duration1 < duration2 (with same streak),
   * the XP reward for duration2 should be >= XP reward for duration1
   */
  it('should award more XP for longer sessions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 720 }),
        fc.integer({ min: 0, max: 720 }),
        fc.integer({ min: 0, max: 100 }),
        (duration1, duration2, streakDays) => {
          const xp1 = focusSessionService.calculateXPReward(duration1, streakDays)
          const xp2 = focusSessionService.calculateXPReward(duration2, streakDays)

          if (duration1 < duration2) {
            expect(xp2).toBeGreaterThanOrEqual(xp1)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Streak bonus is monotonic
   * For any duration, increasing streak should not decrease XP
   */
  it('should award more XP with higher streak', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1440 }),
        fc.integer({ min: 0, max: 100 }),
        (durationMinutes, baseStreak) => {
          const xpNoStreak = focusSessionService.calculateXPReward(durationMinutes, baseStreak)
          const xpWithMoreStreak = focusSessionService.calculateXPReward(
            durationMinutes,
            baseStreak + 1
          )

          expect(xpWithMoreStreak).toBeGreaterThanOrEqual(xpNoStreak)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Streak bonus is capped at 50%
   * For any duration, XP with 5+ day streak should not exceed base * 1.5
   */
  it('should cap streak bonus at 50%', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1440 }),
        (durationMinutes) => {
          const xp5Days = focusSessionService.calculateXPReward(durationMinutes, 5)
          const xp10Days = focusSessionService.calculateXPReward(durationMinutes, 10)
          const xp100Days = focusSessionService.calculateXPReward(durationMinutes, 100)

          // All should be equal or very close (within rounding)
          expect(Math.abs(xp5Days - xp10Days)).toBeLessThanOrEqual(1)
          expect(Math.abs(xp10Days - xp100Days)).toBeLessThanOrEqual(1)

          // Should not exceed base * 1.5
          const maxExpected = Math.floor(durationMinutes * 1.5)
          expect(xp100Days).toBeLessThanOrEqual(Math.max(maxExpected, 5))
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Minimum XP guarantee
   * For any duration and streak, XP should be at least 5
   */
  it('should guarantee minimum 5 XP for any session', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1440 }),
        fc.integer({ min: 0, max: 365 }),
        (durationMinutes, streakDays) => {
          const xpReward = focusSessionService.calculateXPReward(durationMinutes, streakDays)
          expect(xpReward).toBeGreaterThanOrEqual(5)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: XP is always an integer
   * For any duration and streak, XP should be a whole number
   */
  it('should always return integer XP values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1440 }),
        fc.integer({ min: 0, max: 365 }),
        (durationMinutes, streakDays) => {
          const xpReward = focusSessionService.calculateXPReward(durationMinutes, streakDays)
          expect(Number.isInteger(xpReward)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
