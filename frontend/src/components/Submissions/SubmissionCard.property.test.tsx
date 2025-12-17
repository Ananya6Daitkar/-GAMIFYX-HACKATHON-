import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { render, screen, cleanup } from '@testing-library/react'
import { SubmissionCard } from './SubmissionCard'
import { Submission } from '../../types'

describe('SubmissionCard Property Tests', () => {
  // **Feature: gamifyx-platform, Property 4: Submission Status Transitions**
  // **Validates: Requirements 4.1, 4.2**
  it('should display correct status indicator for any valid submission status', () => {
    const validStatuses = ['pending', 'approved', 'revision_needed'] as const

    fc.assert(
      fc.property(fc.constantFrom(...validStatuses), (status) => {
        cleanup()
        const submission: Submission = {
          id: 'test-id',
          studentId: 'student-id',
          code: 'const x = 5;',
          language: 'javascript',
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const { container } = render(
          <SubmissionCard
            submission={submission}
            isExpanded={false}
            onToggleExpand={() => {}}
          />
        )

        // Verify correct color class is applied based on status
        const colorMap = {
          pending: 'border-yellow',
          approved: 'border-green',
          revision_needed: 'border-red',
        }

        const expectedColor = colorMap[status]
        const hasCorrectColor = container.innerHTML.includes(expectedColor)
        expect(hasCorrectColor).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  // **Feature: gamifyx-platform, Property 4: Submission Status Transitions**
  // **Validates: Requirements 4.1, 4.2**
  it('should render submission language for any valid language', () => {
    const languages = ['javascript', 'python', 'java', 'cpp', 'rust', 'go']

    fc.assert(
      fc.property(fc.constantFrom(...languages), (language) => {
        cleanup()
        const submission: Submission = {
          id: 'test-id',
          studentId: 'student-id',
          code: 'code sample',
          language,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        render(
          <SubmissionCard
            submission={submission}
            isExpanded={false}
            onToggleExpand={() => {}}
          />
        )

        const elements = screen.queryAllByText(language)
        expect(elements.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  // **Feature: gamifyx-platform, Property 4: Submission Status Transitions**
  // **Validates: Requirements 4.1, 4.2**
  it('should always render submission date in consistent format', () => {
    // Constrain dates to realistic range (2000-2100)
    const dateGen = fc.date({ min: new Date(2000, 0, 1), max: new Date(2100, 11, 31) })

    fc.assert(
      fc.property(dateGen, (date) => {
        cleanup()
        const submission: Submission = {
          id: 'test-id',
          studentId: 'student-id',
          code: 'code',
          language: 'javascript',
          status: 'pending',
          createdAt: date,
          updatedAt: date,
        }

        const { container } = render(
          <SubmissionCard
            submission={submission}
            isExpanded={false}
            onToggleExpand={() => {}}
          />
        )

        // Verify date is rendered in some format (contains year)
        const hasDate = /\d{4}/.test(container.textContent || '')
        expect(hasDate).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})
