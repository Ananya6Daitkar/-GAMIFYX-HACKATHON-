import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Analytics } from './Analytics'

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

import { api } from '../../utils/api'

describe('Analytics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading spinner initially', () => {
    ;(api.get as any).mockImplementation(() => new Promise(() => {}))

    render(<Analytics />)
    // Check for the loading spinner div
    const spinner = document.querySelector('.w-12.h-12.border-4')
    expect(spinner).toBeInTheDocument()
  })

  it('should fetch and display analytics data', async () => {
    const mockActivityData = [
      { date: '2024-01-01', submissionCount: 2, xpEarned: 100 },
      { date: '2024-01-02', submissionCount: 3, xpEarned: 150 },
    ]

    const mockSkillData = [
      { language: 'JavaScript', proficiency: 85 },
      { language: 'Python', proficiency: 70 },
    ]

    const mockProgressData = [
      { date: '2024-01-01', totalXP: 100, level: 1 },
      { date: '2024-01-02', totalXP: 250, level: 1 },
    ]

    ;(api.get as any).mockImplementation((endpoint: string) => {
      if (endpoint === '/analytics/activity') return Promise.resolve(mockActivityData)
      if (endpoint === '/analytics/skills') return Promise.resolve(mockSkillData)
      if (endpoint === '/analytics/progress') return Promise.resolve(mockProgressData)
      return Promise.resolve([])
    })

    render(<Analytics />)

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Activity Timeline')).toBeInTheDocument()
    expect(screen.getByText('Skill Distribution')).toBeInTheDocument()
    expect(screen.getByText('Progress Over Time')).toBeInTheDocument()
  })

  it('should display error message on API failure', async () => {
    const errorMessage = 'Failed to load analytics'
    ;(api.get as any).mockRejectedValue(new Error(errorMessage))

    render(<Analytics />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should handle empty data gracefully', async () => {
    ;(api.get as any).mockResolvedValue([])

    render(<Analytics />)

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('No activity data available')).toBeInTheDocument()
    expect(screen.getByText('No skill data available')).toBeInTheDocument()
    expect(screen.getByText('No progress data available')).toBeInTheDocument()
  })
})
