import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SubmissionList } from './SubmissionList'
import { Submission } from '../../types'
import * as apiModule from '../../utils/api'

vi.mock('../../utils/api')

describe('SubmissionList Component', () => {
  const mockSubmissions: Submission[] = [
    {
      id: '1',
      studentId: 'student-1',
      code: 'const x = 5;',
      language: 'javascript',
      status: 'pending',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      studentId: 'student-1',
      code: 'function test() { return 42; }',
      language: 'javascript',
      status: 'approved',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading spinner initially', () => {
    vi.mocked(apiModule.api.get).mockImplementation(
      () => new Promise(() => {})
    )
    const { container } = render(<SubmissionList />)
    expect(container.querySelector('[class*="animate-spin"]')).toBeInTheDocument()
  })

  it('should display submissions after loading', async () => {
    vi.mocked(apiModule.api.get).mockResolvedValue(mockSubmissions)
    render(<SubmissionList />)

    await waitFor(() => {
      const elements = screen.getAllByText('javascript')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('should display error message on fetch failure', async () => {
    vi.mocked(apiModule.api.get).mockRejectedValue(
      new Error('Failed to fetch')
    )
    render(<SubmissionList />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading submissions/i)).toBeInTheDocument()
    })
  })

  it('should display empty state when no submissions', async () => {
    vi.mocked(apiModule.api.get).mockResolvedValue([])
    render(<SubmissionList />)

    await waitFor(() => {
      expect(screen.getByText(/No submissions yet/i)).toBeInTheDocument()
    })
  })

  it('should fetch submissions without studentId', async () => {
    vi.mocked(apiModule.api.get).mockResolvedValue(mockSubmissions)
    render(<SubmissionList />)

    await waitFor(() => {
      expect(vi.mocked(apiModule.api.get)).toHaveBeenCalledWith(
        '/submissions'
      )
    })
  })

  it('should fetch submissions with studentId', async () => {
    vi.mocked(apiModule.api.get).mockResolvedValue(mockSubmissions)
    render(<SubmissionList studentId="student-1" />)

    await waitFor(() => {
      expect(vi.mocked(apiModule.api.get)).toHaveBeenCalledWith(
        '/submissions/user/student-1'
      )
    })
  })

  it('should render all submissions', async () => {
    vi.mocked(apiModule.api.get).mockResolvedValue(mockSubmissions)
    render(<SubmissionList />)

    await waitFor(() => {
      const javascriptElements = screen.getAllByText('javascript')
      expect(javascriptElements.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should handle feedback fetching', async () => {
    const submissionWithFeedback = {
      ...mockSubmissions[0],
      feedbackId: 'feedback-1',
    }
    vi.mocked(apiModule.api.get)
      .mockResolvedValueOnce([submissionWithFeedback])
      .mockResolvedValueOnce({
        id: 'feedback-1',
        submissionId: '1',
        insights: ['Good code'],
        confidenceScore: 85,
        codeReferences: [],
        generatedAt: new Date(),
      })

    render(<SubmissionList />)

    await waitFor(() => {
      expect(vi.mocked(apiModule.api.get)).toHaveBeenCalledWith(
        '/submissions/1/feedback'
      )
    })
  })

  it('should handle feedback fetch errors gracefully', async () => {
    const submissionWithFeedback = {
      ...mockSubmissions[0],
      feedbackId: 'feedback-1',
    }
    vi.mocked(apiModule.api.get)
      .mockResolvedValueOnce([submissionWithFeedback])
      .mockRejectedValueOnce(new Error('Feedback fetch failed'))

    render(<SubmissionList />)

    await waitFor(() => {
      expect(screen.getByText('javascript')).toBeInTheDocument()
    })
  })
})
