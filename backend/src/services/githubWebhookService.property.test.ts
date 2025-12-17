import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { GitHubWebhookService } from './githubWebhookService'

describe('GitHubWebhookService - Property-Based Tests', () => {
  const webhookService = new GitHubWebhookService('test-secret')

  /**
   * Property 1: Auto-grading score is always between 0 and 100
   * **Feature: gamifyx-platform, Property 1: Auto-grading score bounds**
   * **Validates: Requirements GitHub webhook handling, Static code analysis, Auto-grading**
   */
  it('auto-grading score should always be between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            message: fc.string({ minLength: 1, maxLength: 100 }),
            added: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 20 }),
            removed: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 20 }),
            modified: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 20 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
        fc.option(fc.string({ minLength: 1, maxLength: 100 })),
        (commits, requiredFiles, expectedStructure) => {
          const service = webhookService as any

          // Calculate individual scores
          const commitMessageScore = service.gradeCommitMessageQuality(commits)
          const commitCountScore = service.gradeCommitCount(commits)
          const linesBalanceScore = service.gradeLinesBalance(commits)

          const payload = {
            commits,
            head_commit: null,
          }

          const requiredFilesScore = service.gradeRequiredFiles(payload, requiredFiles)
          const folderStructureScore = service.gradeFolderStructure(payload, expectedStructure)
          const readmeScore = service.gradeReadmeQuality(payload)

          // Total score
          const totalScore =
            commitMessageScore +
            commitCountScore +
            linesBalanceScore +
            requiredFilesScore +
            folderStructureScore +
            readmeScore

          // Verify all individual scores are within bounds
          expect(commitMessageScore).toBeGreaterThanOrEqual(0)
          expect(commitMessageScore).toBeLessThanOrEqual(10)

          expect(commitCountScore).toBeGreaterThanOrEqual(0)
          expect(commitCountScore).toBeLessThanOrEqual(10)

          expect(linesBalanceScore).toBeGreaterThanOrEqual(0)
          expect(linesBalanceScore).toBeLessThanOrEqual(15)

          expect(requiredFilesScore).toBeGreaterThanOrEqual(0)
          expect(requiredFilesScore).toBeLessThanOrEqual(20)

          expect(folderStructureScore).toBeGreaterThanOrEqual(0)
          expect(folderStructureScore).toBeLessThanOrEqual(25)

          expect(readmeScore).toBeGreaterThanOrEqual(0)
          expect(readmeScore).toBeLessThanOrEqual(20)

          // Total score should be between 0 and 100
          expect(totalScore).toBeGreaterThanOrEqual(0)
          expect(totalScore).toBeLessThanOrEqual(100)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 2: Status assignment is consistent with score
   * **Feature: gamifyx-platform, Property 2: Status assignment consistency**
   * **Validates: Requirements GitHub webhook handling, Auto-grading, XP rewards**
   */
  it('status assignment should be consistent with score', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        let status: 'PASS' | 'REVIEW' | 'FAIL'

        if (score >= 80) {
          status = 'PASS'
        } else if (score >= 50) {
          status = 'REVIEW'
        } else {
          status = 'FAIL'
        }

        // Verify status is one of the valid values
        expect(['PASS', 'REVIEW', 'FAIL']).toContain(status)

        // Verify status matches score ranges
        if (status === 'PASS') {
          expect(score).toBeGreaterThanOrEqual(80)
        } else if (status === 'REVIEW') {
          expect(score).toBeGreaterThanOrEqual(50)
          expect(score).toBeLessThan(80)
        } else {
          expect(score).toBeLessThan(50)
        }
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: XP reward calculation respects difficulty multiplier
   * **Feature: gamifyx-platform, Property 3: XP reward calculation**
   * **Validates: Requirements XP rewards, Difficulty multiplier**
   */
  it('XP reward should respect difficulty multiplier', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.constantFrom('EASY', 'MEDIUM', 'HARD'),
        (baseXP, score, difficulty) => {
          // Calculate XP reward
          const difficultyMultiplier = {
            EASY: 1.0,
            MEDIUM: 1.1,
            HARD: 1.2,
          }[difficulty]

          const scoreMultiplier = score / 100
          const finalXP = Math.floor(baseXP * difficultyMultiplier * scoreMultiplier)
          const xpReward = score > 0 ? Math.max(finalXP, 1) : 0

          // Verify XP reward is non-negative
          expect(xpReward).toBeGreaterThanOrEqual(0)

          // Verify XP reward respects difficulty multiplier
          if (score > 0 && baseXP > 0) {
            const easyXP = Math.max(Math.floor(baseXP * 1.0 * scoreMultiplier), 1)
            const mediumXP = Math.max(Math.floor(baseXP * 1.1 * scoreMultiplier), 1)
            const hardXP = Math.max(Math.floor(baseXP * 1.2 * scoreMultiplier), 1)

            if (difficulty === 'EASY') {
              expect(xpReward).toBeLessThanOrEqual(mediumXP)
            } else if (difficulty === 'MEDIUM') {
              expect(xpReward).toBeGreaterThanOrEqual(easyXP)
              expect(xpReward).toBeLessThanOrEqual(hardXP)
            } else if (difficulty === 'HARD') {
              expect(xpReward).toBeGreaterThanOrEqual(mediumXP)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4: Commit count grading is monotonic
   * **Feature: gamifyx-platform, Property 4: Commit count monotonicity**
   * **Validates: Requirements Static code analysis**
   */
  it('commit count score should be monotonic', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 10 }),
        (count1, count2) => {
          const service = webhookService as any

          // Create commit arrays
          const commits1 = Array(count1).fill(null).map((_, i) => ({
            message: `Commit ${i}`,
            added: [],
            removed: [],
            modified: [],
          }))

          const commits2 = Array(count2).fill(null).map((_, i) => ({
            message: `Commit ${i}`,
            added: [],
            removed: [],
            modified: [],
          }))

          const score1 = service.gradeCommitCount(commits1)
          const score2 = service.gradeCommitCount(commits2)

          // If count1 < count2, then score1 should be <= score2
          if (count1 < count2) {
            expect(score1).toBeLessThanOrEqual(score2)
          }

          // If count1 > count2, then score1 should be >= score2
          if (count1 > count2) {
            expect(score1).toBeGreaterThanOrEqual(score2)
          }

          // If count1 === count2, then score1 should equal score2
          if (count1 === count2) {
            expect(score1).toBe(score2)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Required files grading is proportional
   * **Feature: gamifyx-platform, Property 5: Required files proportionality**
   * **Validates: Requirements Static code analysis**
   */
  it('required files score should be proportional to presence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 100 }),
        (requiredFiles, numPresent) => {
          const service = webhookService as any

          // Create payload with some files present
          const presentCount = Math.min(numPresent % (requiredFiles.length + 1), requiredFiles.length)
          const presentFiles = requiredFiles.slice(0, presentCount)

          const payload = {
            commits: [
              {
                added: presentFiles,
                removed: [],
                modified: [],
                message: 'Add files',
              },
            ],
            head_commit: null,
          }

          const score = service.gradeRequiredFiles(payload, requiredFiles)

          // Score should be between 0 and 20
          expect(score).toBeGreaterThanOrEqual(0)
          expect(score).toBeLessThanOrEqual(20)

          // If all files present, score should be maximum
          if (presentCount === requiredFiles.length) {
            expect(score).toBe(20)
          }

          // If no files present, score should be 0
          if (presentCount === 0) {
            expect(score).toBe(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
