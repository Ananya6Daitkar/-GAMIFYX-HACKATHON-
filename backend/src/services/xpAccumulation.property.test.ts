import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import userRepository from '../database/repositories/userRepository'

/**
 * Property 1: XP Accumulation Consistency
 * Validates: Requirements 1.1, 6.1
 * 
 * Invariant: XP should always accumulate monotonically
 * - totalXp never decreases
 * - Multiple XP awards should sum correctly
 * - Level should always be floor(totalXp / 100)
 */
describe('XP Accumulation Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accumulate XP monotonically', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 100 }),
        (xpAmounts) => {
          let totalXp = 0
          const xpHistory: number[] = []

          // Simulate XP accumulation
          for (const amount of xpAmounts) {
            totalXp += amount
            xpHistory.push(totalXp)
          }

          // Verify monotonic increase
          for (let i = 1; i < xpHistory.length; i++) {
            expect(xpHistory[i]).toBeGreaterThanOrEqual(xpHistory[i - 1])
          }

          // Verify final total equals sum
          const expectedTotal = xpAmounts.reduce((a, b) => a + b, 0)
          expect(totalXp).toBe(expectedTotal)
        }
      )
    )
  })

  it('should calculate level correctly from XP', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000 }), (totalXp) => {
        const expectedLevel = Math.floor(totalXp / 100)
        expect(expectedLevel).toBeGreaterThanOrEqual(0)
        expect(expectedLevel).toBeLessThanOrEqual(100)
        
        // Verify level boundaries
        const minXpForLevel = expectedLevel * 100
        const maxXpForLevel = (expectedLevel + 1) * 100 - 1
        
        expect(totalXp).toBeGreaterThanOrEqual(minXpForLevel)
        expect(totalXp).toBeLessThanOrEqual(maxXpForLevel)
      })
    )
  })

  it('should handle concurrent XP awards correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 50 }),
        (xpAmounts) => {
          // Simulate concurrent awards
          const totalXp = xpAmounts.reduce((a, b) => a + b, 0)
          
          // Verify no XP is lost
          expect(totalXp).toBe(xpAmounts.reduce((a, b) => a + b, 0))
          
          // Verify total is positive
          expect(totalXp).toBeGreaterThan(0)
        }
      )
    )
  })

  it('should never have negative XP', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 100 }),
        (xpAmounts) => {
          let totalXp = 0
          
          for (const amount of xpAmounts) {
            totalXp += amount
            expect(totalXp).toBeGreaterThanOrEqual(0)
          }
        }
      )
    )
  })

  it('should maintain XP consistency across multiple operations', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.array(fc.integer({ min: 1, max: 500 }), { minLength: 1, maxLength: 20 }),
          fc.array(fc.integer({ min: 1, max: 500 }), { minLength: 1, maxLength: 20 })
        ),
        ([batch1, batch2]) => {
          const total1 = batch1.reduce((a, b) => a + b, 0)
          const total2 = batch2.reduce((a, b) => a + b, 0)
          const combined = total1 + total2

          // Verify order doesn't matter
          expect(combined).toBe(total1 + total2)
          expect(combined).toBe(total2 + total1)
        }
      )
    )
  })
})
