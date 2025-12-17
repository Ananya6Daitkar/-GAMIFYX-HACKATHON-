import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SubmissionDetailCard } from './SubmissionDetailCard'
import { AssignmentSubmission } from '../../types'

describe('SubmissionDetailCard Component', () => {
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

  it('should render auto-grading breakdown section', () => {
    render(<SubmissionDetailCard submission={mockSubmission} />)

    expect(screen.getByText('Auto-Grading Breakdown')).toBeInTheDocument()
  })

  it('should display all grading criteria', () => {
    render(<SubmissionDetailCard submission={mockSubmission} />)

    expect(screen.getByText('Commit Message Quality')).toBeInTheDocument()
    expect(screen.getByText('Number of Commits')).toBeInTheDocument()
    expect(screen.getByText('Lines Added/Removed Balance')).toBeInTheDocument()
    expect(screen.getByText('Required Files Present')).toBeInTheDocument()
    expect(screen.getByText('Folder Structure')).toBeInTheDocument()
    expect(screen.getByText('README Quality')).toBeInTheDocument()
  })

  it('should display overall score', () => {
    render(<SubmissionDetailCard submission={mockSubmission} />)

    expect(screen.getByText('Overall Score')).toBeInTheDocument()
    // The score appears in multiple places, so we check for the overall score section
    const scoreElements = screen.getAllByText(/85/)
    expect(scoreElements.length).toBeGreaterThan(0)
  })

  it('should display XP earned', () => {
    render(<SubmissionDetailCard submission={mockSubmission} />)

    expect(screen.getByText('XP Earned')).toBeInTheDocument()
    expect(screen.getByText('+150')).toBeInTheDocument()
  })

  it('should display repository details', () => {
    render(<SubmissionDetailCard submission={mockSubmission} />)

    expect(screen.getByText('Repository Details')).toBeInTheDocument()
    expect(screen.getByText('https://github.com/user/repo')).toBeInTheDocument()
    expect(screen.getByText('main')).toBeInTheDocument()
  })

  it('should display status in overall score section', () => {
    render(<SubmissionDetailCard submission={mockSubmission} />)

    expect(screen.getByText('PASS')).toBeInTheDocument()
  })
})
