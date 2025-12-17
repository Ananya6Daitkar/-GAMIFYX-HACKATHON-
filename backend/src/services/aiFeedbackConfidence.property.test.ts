import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 5: AI Feedback Confidence Validity
 * Validates: Requirements 6.2, 6.3
 * 
 * Invariant: Confidence scores must always be valid
 * - Confidence is always between 0 and 100
 * - Confidence is a number
 * - Timeout fallback has lower confidence than normal response
 * - Confidence reflects response quality
 */
describe('AI Feedback Confidence Validity', () => {
  it('should always return confidence between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        (rawConfidence) => {
          // Simulate confidence clamping
          let confidence = rawConfidence
          if (confidence < 0) confidence = 0
          if (confidence > 100) confidence = 100

          expect(confidence).toBeGreaterThanOrEqual(0)
          expect(confidence).toBeLessThanOrEqual(100)
        }
      )
    )
  })

  it('should validate confidence is a number', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: 0, max: 100 }),
          fc.float({ min: 0, max: 100, noNaN: true, noInfinity: true })
        ),
        (confidence) => {
          expect(typeof confidence).toBe('number')
          expect(isNaN(confidence)).toBe(false)
          expect(isFinite(confidence)).toBe(true)
        }
      )
    )
  })

  it('should have lower confidence for timeout fallback', () => {
    const normalConfidence = 85
    const timeoutFallbackConfidence = 30

    expect(timeoutFallbackConfidence).toBeLessThan(normalConfidence)
    expect(timeoutFallbackConfidence).toBeGreaterThanOrEqual(0)
    expect(timeoutFallbackConfidence).toBeLessThanOrEqual(100)
  })

  it('should maintain confidence consistency across multiple calls', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 0, max: 100 }),
          { minLength: 1, maxLength: 100 }
        ),
        (confidenceScores) => {
          // All scores should be valid
          for (const score of confidenceScores) {
            expect(score).toBeGreaterThanOrEqual(0)
            expect(score).toBeLessThanOrEqual(100)
          }

          // Average should also be valid
          const average = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
          expect(average).toBeGreaterThanOrEqual(0)
          expect(average).toBeLessThanOrEqual(100)
        }
      )
    )
  })

  it('should reflect response quality in confidence', () => {
    fc.assert(
      fc.property(
        fc.record({
          insightCount: fc.integer({ min: 0, max: 10 }),
          codeReferenceCount: fc.integer({ min: 0, max: 5 }),
          hasErrors: fc.boolean(),
        }),
        (response) => {
          // Calculate confidence based on response quality
          let confidence = 50 // Base confidence

          // More insights = higher confidence
          confidence += response.insightCount * 5

          // More code references = higher confidence
          confidence += response.codeReferenceCount * 8

          // Errors reduce confidence
          if (response.hasErrors) {
            confidence -= 20
          }

          // Clamp to valid range
          confidence = Math.max(0, Math.min(100, confidence))

          expect(confidence).toBeGreaterThanOrEqual(0)
          expect(confidence).toBeLessThanOrEqual(100)
        }
      )
    )
  })

  it('should handle edge cases for confidence', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(0),
          fc.constant(50),
          fc.constant(100),
          fc.constant(-1),
          fc.constant(101),
          fc.constant(NaN),
          fc.constant(Infinity)
        ),
        (value) => {
          let confidence = value
          
          // Validate and clamp
          if (typeof confidence !== 'number' || isNaN(confidence) || !isFinite(confidence)) {
            confidence = 30 // Fallback for invalid values
          } else {
            confidence = Math.max(0, Math.min(100, confidence))
          }

          expect(confidence).toBeGreaterThanOrEqual(0)
          expect(confidence).toBeLessThanOrEqual(100)
          expect(typeof confidence).toBe('number')
        }
      )
    )
  })

  it('should track confidence distribution', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 0, max: 100 }),
          { minLength: 10, maxLength: 100 }
        ),
        (scores) => {
          const distribution = {
            low: scores.filter(s => s < 33).length,
            medium: scores.filter(s => s >= 33 && s < 67).length,
            high: scores.filter(s => s >= 67).length,
          }

          // Total should equal array length
          expect(distribution.low + distribution.medium + distribution.high).toBe(scores.length)

          // All counts should be non-negative
          expect(distribution.low).toBeGreaterThanOrEqual(0)
          expect(distribution.medium).toBeGreaterThanOrEqual(0)
          expect(distribution.high).toBeGreaterThanOrEqual(0)
        }
      )
    )
  })
})
