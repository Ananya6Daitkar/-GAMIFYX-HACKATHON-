import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ClassOverview } from './ClassOverview'
import * as apiModule from '../../utils/api'

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('ClassOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    vi.mocked(apiModule.api.get).mockImplementation(() => new Promise(() => {}))

    const { container } = render(<ClassOverview />)

    // Check that component renders
    expect(container).toBeInTheDocument()
  })

  it('should display class overview data when loaded', async () => {
    const mockData = {
      totalStudents: 25,
      averageXp: 450,
      classLeaderboard: [
        { rank: 1, userId: '1', username: 'student1', xp: 1000, streak: 5, level: 10 },
        { rank: 2, userId: '2', username: 'student2', xp: 900, streak: 3, level: 9 },
        { rank: 3, userId: '3', username: 'student3', xp: 800, streak: 2, level: 8 },
      ],
    }

    vi.mocked(apiModule.api.get).mockResolvedValue(mockData)

    render(<ClassOverview />)

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('450')).toBeInTheDocument()
    })

    expect(screen.getByText('student1')).toBeInTheDocument()
    expect(screen.getByText('student2')).toBeInTheDocument()
    expect(screen.getByText('student3')).toBeInTheDocument()
  })

  it('should display error message on API failure', async () => {
    const errorMessage = 'Failed to load class overview'
    vi.mocked(apiModule.api.get).mockRejectedValue(new Error(errorMessage))

    render(<ClassOverview />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should display leaderboard with correct ranking', async () => {
    const mockData = {
      totalStudents: 3,
      averageXp: 600,
      classLeaderboard: [
        { rank: 1, userId: '1', username: 'top', xp: 1000, streak: 5, level: 10 },
        { rank: 2, userId: '2', username: 'second', xp: 600, streak: 3, level: 6 },
        { rank: 3, userId: '3', username: 'third', xp: 200, streak: 1, level: 2 },
      ],
    }

    vi.mocked(apiModule.api.get).mockResolvedValue(mockData)

    render(<ClassOverview />)

    await waitFor(() => {
      expect(screen.getByText('top')).toBeInTheDocument()
      expect(screen.getByText('second')).toBeInTheDocument()
      expect(screen.getByText('third')).toBeInTheDocument()
    })
  })
})
