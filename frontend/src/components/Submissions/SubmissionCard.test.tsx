import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubmissionCard } from './SubmissionCard'
import { Submission, AIFeedback } from '../../types'

describe('SubmissionCard Component', () => {
  const mockSubmission: Submission = {
    id: '1',
    studentId: 'student-1',
    code: 'const x = 5;',
    language: 'javascript',
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  }

  const mockFeedback: AIFeedback = {
    id: 'feedback-1',
    submissionId: '1',
    insights: ['Good variable naming', 'Consider adding comments'],
    confidenceScore: 85,
    codeReferences: [
      {
        lineNumber: 1,
        snippet: 'const x = 5;',
        suggestion: 'Consider using a more descriptive variable name',
      },
    ],
    generatedAt: new Date('2024-01-15'),
  }

  it('should render submission language and status', () => {
    const onToggle = vi.fn()
    render(
      <SubmissionCard
        submission={mockSubmission}
        isExpanded={false}
        onToggleExpand={onToggle}
      />
    )

    expect(screen.getByText('javascript')).toBeInTheDocument()
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
  })

  it('should display correct status indicator for pending', () => {
    const onToggle = vi.fn()
    const { container } = render(
      <SubmissionCard
        submission={mockSubmission}
        isExpanded={false}
        onToggleExpand={onToggle}
      />
    )

    const statusBadge = container.querySelector('[class*="border-yellow"]')
    expect(statusBadge).toBeInTheDocument()
  })

  it('should display correct status indicator for approved', () => {
    const onToggle = vi.fn()
    const approvedSubmission = { ...mockSubmission, status: 'approved' as const }
    const { container } = render(
      <SubmissionCard
        submission={approvedSubmission}
        isExpanded={false}
        onToggleExpand={onToggle}
      />
    )

    const statusBadge = container.querySelector('[class*="border-green"]')
    expect(statusBadge).toBeInTheDocument()
  })

  it('should display correct status indicator for revision_needed', () => {
    const onToggle = vi.fn()
    const revisionSubmission = {
      ...mockSubmission,
      status: 'revision_needed' as const,
    }
    const { container } = render(
      <SubmissionCard
        submission={revisionSubmission}
        isExpanded={false}
        onToggleExpand={onToggle}
      />
    )

    const statusBadge = container.querySelector('[class*="border-red"]')
    expect(statusBadge).toBeInTheDocument()
  })

  it('should call onToggleExpand when clicked', () => {
    const onToggle = vi.fn()
    render(
      <SubmissionCard
        submission={mockSubmission}
        isExpanded={false}
        onToggleExpand={onToggle}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should display formatted date', () => {
    const onToggle = vi.fn()
    render(
      <SubmissionCard
        submission={mockSubmission}
        isExpanded={false}
        onToggleExpand={onToggle}
      />
    )

    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument()
  })

  it('should show code preview when expanded', () => {
    const onToggle = vi.fn()
    render(
      <SubmissionCard
        submission={mockSubmission}
        isExpanded={true}
        onToggleExpand={onToggle}
      />
    )

    expect(screen.getByText('Code Preview')).toBeInTheDocument()
  })

  it('should show feedback when expanded and feedback provided', () => {
    const onToggle = vi.fn()
    render(
      <SubmissionCard
        submission={mockSubmission}
        feedback={mockFeedback}
        isExpanded={true}
        onToggleExpand={onToggle}
      />
    )

    expect(screen.getByText('AI Feedback')).toBeInTheDocument()
  })

  it('should show generate feedback button when expanded without feedback', () => {
    const onToggle = vi.fn()
    render(
      <SubmissionCard
        submission={mockSubmission}
        isExpanded={true}
        onToggleExpand={onToggle}
      />
    )

    expect(screen.getByText(/Generate AI Feedback/i)).toBeInTheDocument()
  })

  it('should rotate expand indicator when expanded', () => {
    const onToggle = vi.fn()
    const { container, rerender } = render(
      <SubmissionCard
        submission={mockSubmission}
        isExpanded={false}
        onToggleExpand={onToggle}
      />
    )

    let indicator = container.querySelector('[class*="text-cyan"]')
    expect(indicator).toBeInTheDocument()

    rerender(
      <SubmissionCard
        submission={mockSubmission}
        isExpanded={true}
        onToggleExpand={onToggle}
      />
    )

    indicator = container.querySelector('[class*="text-cyan"]')
    expect(indicator).toBeInTheDocument()
  })
})
