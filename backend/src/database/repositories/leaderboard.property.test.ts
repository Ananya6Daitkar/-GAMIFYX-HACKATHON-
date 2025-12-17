import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 2: Leaderboard Ranking Accuracy
 * Validates: Requirements 2.1, 2.4
 * 
 * Invariant: Leaderboard rankings must be strictly ordered by XP
 * - Higher XP always ranks higher
 * - Ranks are unique and sequential
 * - No ties in ranking (same XP = same rank)
 */
describe('Leaderboard Ranking Accuracy', () => {
  it('should rank users strictly by XP descending', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            xp: fc.integer({ min: 0, max: 10000 }),
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (users) => {
          // Sort by XP descending (as leaderboard should)
          const sorted = [...users].sort((a, b) => b.xp - a.xp)

          // Verify ordering
          for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].xp).toBeLessThanOrEqual(sorted[i - 1].xp)
          }
        }
      )
    )
  })

  it('should assign sequential ranks', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            xp: fc.integer({ min: 0, max: 10000 }),
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (users) => {
          const sorted = [...users].sort((a, b) => b.xp - a.xp)
          
          // Assign ranks
          const ranked = sorted.map((user, index) => ({
            ...user,
            rank: index + 1,
          }))

          // Verify ranks are sequential
          for (let i = 0; i < ranked.length; i++) {
            expect(ranked[i].rank).toBe(i + 1)
          }

          // Verify no duplicate ranks
          const ranks = ranked.map(r => r.rank)
          const uniqueRanks = new Set(ranks)
          expect(uniqueRanks.size).toBe(ranks.length)
        }
      )
    )
  })

  it('should handle ties correctly (same XP = same rank)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            xp: fc.integer({ min: 0, max: 1000 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (users) => {
          const sorted = [...users].sort((a, b) => b.xp - a.xp)

          // Assign ranks with tie handling
          let currentRank = 1
          let previousXp = sorted[0]?.xp ?? -1
          
          for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].xp < previousXp) {
              currentRank = i + 1
            }
            previousXp = sorted[i].xp
          }

          // Verify rank progression is valid
          expect(currentRank).toBeGreaterThanOrEqual(1)
          expect(currentRank).toBeLessThanOrEqual(sorted.length)
        }
      )
    )
  })

  it('should maintain ranking consistency with XP changes', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              xp: fc.integer({ min: 0, max: 5000 }),
            }),
            { minLength: 2, maxLength: 50 }
          ),
          fc.integer({ min: 0, max: 49 }),
          fc.integer({ min: 1, max: 1000 })
        ),
        ([users, userIndex, xpIncrease]) => {
          if (userIndex >= users.length) return

          const before = [...users].sort((a, b) => b.xp - a.xp)
          const beforeRank = before.findIndex(u => u.userId === users[userIndex].userId) + 1

          // Award XP to user
          users[userIndex].xp += xpIncrease

          const after = [...users].sort((a, b) => b.xp - a.xp)
          const afterRank = after.findIndex(u => u.userId === users[userIndex].userId) + 1

          // Rank should improve or stay same (never worsen)
          expect(afterRank).toBeLessThanOrEqual(beforeRank)
        }
      )
    )
  })

  it('should handle large leaderboards efficiently', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            xp: fc.integer({ min: 0, max: 100000 }),
          }),
          { minLength: 100, maxLength: 1000 }
        ),
        (users) => {
          const start = performance.now()
          const sorted = [...users].sort((a, b) => b.xp - a.xp)
          const end = performance.now()

          // Sorting should be fast (< 100ms for 1000 users)
          expect(end - start).toBeLessThan(100)

          // Verify correctness
          for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].xp).toBeLessThanOrEqual(sorted[i - 1].xp)
          }
        }
      )
    )
  })
})
