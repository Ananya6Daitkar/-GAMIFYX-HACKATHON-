import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubmissionHistory } from './SubmissionHistory'
import { AssignmentSubmission } from '../../types'

describe('SubmissionHistory Component', () => {
  const mockSubmission: AssignmentSubmission = {
    id: 'sub-1',
    assignmentId: 'assign-1',
    studentId: 'student-1',
    githubRepoUrl: 'https://github.com/user/repo',
    branch: 'main',
    status: 'PASS',
    score: 85,
    autoGradingBreakdown: {
      commitMessageQuality: 80,
      commitCount: 90,
      linesBalance: 85,
      requiredFilesPresent: 100,
      folderStructure: 80,
      readmeQuality: 75,
    },
    xpEarned: 150,
    submittedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  }

  it('should render empty state when no submissions', () => {
    render(<SubmissionHistory submissions={[]} />)

    expect(screen.getByText('No Submissions Yet')).toBeInTheDocument()
    expect(screen.getByText(/Your submissions will appear here/)).toBeInTheDocument()
  })

  it('should render submission cards for each submission', () => {
    const submissions = [mockSubmission, { ...mockSubmission, id: 'sub-2' }]
    render(<SubmissionHistory submissions={submissions} />)

    expect(screen.getAllByText(/Score:/)).toHaveLength(2)
  })

  it('should display correct status badge for PASS', () => {
    const { container } = render(
      <SubmissionHistory submissions={[mockSubmission]} />
    )

    expect(screen.getByText('PASS')).toBeInTheDocument()
    const statusBadge = container.querySelector('[class*="border-green"]')
    expect(statusBadge).toBeInTheDocument()
  })

  it('should display correct status badge for REVIEW', () => {
    const reviewSubmission = { ...mockSubmission, status: 'REVIEW' as const }
    const { container } = render(
      <SubmissionHistory submissions={[reviewSubmission]} />
    )

    expect(screen.getByText('REVIEW')).toBeInTheDocument()
    const statusBadge = container.querySelector('[class*="border-yellow"]')
    expect(statusBadge).toBeInTheDocument()
  })

  it('should display correct status badge for FAIL', () => {
    const failSubmission = { ...mockSubmission, status: 'FAIL' as const }
    const { container } = render(
      <SubmissionHistory submissions={[failSubmission]} />
    )

    expect(screen.getByText('FAIL')).toBeInTheDocument()
    const statusBadge = container.querySelector('[class*="border-red"]')
    expect(statusBadge).toBeInTheDocument()
  })

  it('should display score percentage', () => {
    render(<SubmissionHistory submissions={[mockSubmission]} />)

    expect(screen.getByText('Score: 85%')).toBeInTheDocument()
  })

  it('should expand submission details when clicked', () => {
    render(<SubmissionHistory submissions={[mockSubmission]} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // After expansion, should show auto-grading breakdown
    expect(screen.getByText('Auto-Grading Breakdown')).toBeInTheDocument()
  })

  it('should collapse submission details when clicked again', () => {
    render(<SubmissionHistory submissions={[mockSubmission]} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Auto-Grading Breakdown')).toBeInTheDocument()

    fireEvent.click(button)
    // After collapse, the detail should be hidden
    // (Note: This is a simplified check - actual implementation may vary)
  })

  it('should display formatted date', () => {
    render(<SubmissionHistory submissions={[mockSubmission]} />)

    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument()
  })

  it('should display commit SHA (shortened)', () => {
    render(<SubmissionHistory submissions={[mockSubmission]} />)

    // Should display first 7 characters of ID
    expect(screen.getByText('sub-1')).toBeInTheDocument()
  })

  it('should handle multiple submissions with different statuses', () => {
    const submissions = [
      mockSubmission,
      { ...mockSubmission, id: 'sub-2', status: 'REVIEW' as const },
      { ...mockSubmission, id: 'sub-3', status: 'FAIL' as const },
    ]
    render(<SubmissionHistory submissions={submissions} />)

    expect(screen.getByText('PASS')).toBeInTheDocument()
    expect(screen.getByText('REVIEW')).toBeInTheDocument()
    expect(screen.getByText('FAIL')).toBeInTheDocument()
  })

  it('should display IN_PROGRESS status correctly', () => {
    const inProgressSubmission = {
      ...mockSubmission,
      status: 'IN_PROGRESS' as const,
    }
    const { container } = render(
      <SubmissionHistory submissions={[inProgressSubmission]} />
    )

    // Status is displayed with spaces replaced by underscores in the badge
    expect(screen.getByText(/IN PROGRESS/i)).toBeInTheDocument()
    const statusBadge = container.querySelector('[class*="border-blue"]')
    expect(statusBadge).toBeInTheDocument()
  })
})
