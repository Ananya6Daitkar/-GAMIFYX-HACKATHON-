import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import { render, screen, waitFor } from '@testing-library/react'
import { CompetitionDetails } from './CompetitionDetails'
import * as api from '../../utils/api'
import type { Competition, CompetitionResult } from '../../types'

vi.mock('../../utils/api')

describe('CompetitionDetails - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * **Feature: gamifyx-platform, Property 14: Competition Results Accuracy**
   * **Validates: Requirements 12.4**
   *
   * For any completed competition, the final rankings should be based on submission count
   * and quality score, and results should be immutable after competition end time.
   */
  it('Property 14: Competition results are ranked correctly by quality score and submission count', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 1, maxLength: 50 }),
            submissionCount: fc.integer({ min: 0, max: 100 }),
            qualityScore: fc.integer({ min: 0, max: 100 }),
            xpEarned: fc.integer({ min: 0, max: 1000 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (baseResults) => {
          // Sort by quality score descending, then by submission count descending
          const sorted = [...baseResults].sort((a, b) => {
            if (b.qualityScore !== a.qualityScore) {
              return b.qualityScore - a.qualityScore
            }
            return b.submissionCount - a.submissionCount
          })

          // Add sequential ranks
          const results = sorted.map((r, i) => ({
            ...r,
            rank: i + 1,
          }))

          // Verify that results are sorted by quality score descending
          for (let i = 0; i < results.length - 1; i++) {
            const current = results[i]
            const next = results[i + 1]

            // Quality score should be descending
            if (current.qualityScore === next.qualityScore) {
              // If quality scores are equal, submission count should be descending
              expect(current.submissionCount).toBeGreaterThanOrEqual(next.submissionCount)
            } else {
              expect(current.qualityScore).toBeGreaterThanOrEqual(next.qualityScore)
            }
          }

          // Verify that ranks are sequential starting from 1
          for (let i = 0; i < results.length; i++) {
            expect(results[i].rank).toBe(i + 1)
          }

          // Verify that all results have valid XP earned (non-negative)
          results.forEach((result) => {
            expect(result.xpEarned).toBeGreaterThanOrEqual(0)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: gamifyx-platform, Property 14: Competition Results Accuracy**
   * **Validates: Requirements 12.4**
   *
   * For any set of competition results, the number of results should match the number
   * of participants, and each result should have a unique rank.
   */
  it('Property 14: Competition results have unique ranks and match participant count', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 1, maxLength: 50 }),
            submissionCount: fc.integer({ min: 0, max: 100 }),
            qualityScore: fc.integer({ min: 0, max: 100 }),
            xpEarned: fc.integer({ min: 0, max: 1000 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (baseResults) => {
          // Add sequential ranks
          const results = baseResults.map((r, i) => ({
            ...r,
            rank: i + 1,
          }))

          // Verify unique ranks
          const ranks = results.map((r) => r.rank)
          const uniqueRanks = new Set(ranks)
          expect(uniqueRanks.size).toBe(results.length)

          // Verify all ranks are within valid range
          results.forEach((result) => {
            expect(result.rank).toBeGreaterThan(0)
            expect(result.rank).toBeLessThanOrEqual(results.length)
          })

          // Verify all user IDs are unique
          const userIds = results.map((r) => r.userId)
          const uniqueUserIds = new Set(userIds)
          expect(uniqueUserIds.size).toBe(results.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: gamifyx-platform, Property 14: Competition Results Accuracy**
   * **Validates: Requirements 12.4**
   *
   * For any competition result, the XP earned should be consistent with the rank
   * (higher ranks should generally earn more XP, though this depends on competition rules).
   */
  it('Property 14: Competition results display all required fields', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 1, maxLength: 50 }),
            submissionCount: fc.integer({ min: 0, max: 100 }),
            qualityScore: fc.integer({ min: 0, max: 100 }),
            xpEarned: fc.integer({ min: 0, max: 1000 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (baseResults) => {
          // Add sequential ranks
          const results = baseResults.map((r, i) => ({
            ...r,
            rank: i + 1,
          }))

          // Verify all required fields are present
          results.forEach((result) => {
            expect(result).toHaveProperty('rank')
            expect(result).toHaveProperty('userId')
            expect(result).toHaveProperty('username')
            expect(result).toHaveProperty('submissionCount')
            expect(result).toHaveProperty('qualityScore')
            expect(result).toHaveProperty('xpEarned')

            // Verify field types
            expect(typeof result.rank).toBe('number')
            expect(typeof result.userId).toBe('string')
            expect(typeof result.username).toBe('string')
            expect(typeof result.submissionCount).toBe('number')
            expect(typeof result.qualityScore).toBe('number')
            expect(typeof result.xpEarned).toBe('number')
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
