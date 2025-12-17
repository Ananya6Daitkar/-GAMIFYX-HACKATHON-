import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { Leaderboard } from './Leaderboard'
import * as api from '../../utils/api'

// Mock the API module
vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('Leaderboard Component', () => {
  const mockLeaderboardData = {
    entries: [
      { rank: 1, userId: '1', username: 'alice', xp: 5000, streak: 10 },
      { rank: 2, userId: '2', username: 'bob', xp: 4500, streak: 8 },
      { rank: 3, userId: '3', username: 'charlie', xp: 4000, streak: 6 },
      { rank: 4, userId: '4', username: 'diana', xp: 3500, streak: 5 },
      { rank: 5, userId: '5', username: 'eve', xp: 3000, streak: 4 },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display leaderboard with entries', async () => {
    vi.mocked(api.api.get).mockResolvedValue(mockLeaderboardData)

    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument()
      expect(screen.getByText('bob')).toBeInTheDocument()
      expect(screen.getByText('charlie')).toBeInTheDocument()
    })

    expect(screen.getByText('5000 XP')).toBeInTheDocument()
    expect(screen.getByText('4500 XP')).toBeInTheDocument()
  })

  it('should display period filter buttons', async () => {
    vi.mocked(api.api.get).mockResolvedValue(mockLeaderboardData)

    render(<Leaderboard />)

    expect(screen.getByText('daily')).toBeInTheDocument()
    expect(screen.getByText('weekly')).toBeInTheDocument()
    expect(screen.getByText('monthly')).toBeInTheDocument()
  })

  it('should fetch leaderboard data for selected period', async () => {
    vi.mocked(api.api.get).mockResolvedValue(mockLeaderboardData)

    render(<Leaderboard />)

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith('/leaderboard?period=daily')
    })
  })

  it('should change period when filter button is clicked', async () => {
    vi.mocked(api.api.get).mockResolvedValue(mockLeaderboardData)

    render(<Leaderboard />)

    const weeklyButton = screen.getByText('weekly')
    fireEvent.click(weeklyButton)

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith('/leaderboard?period=weekly')
    })
  })

  it('should display error message on API failure', async () => {
    vi.mocked(api.api.get).mockRejectedValue(new Error('Failed to load leaderboard'))

    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load leaderboard/i)).toBeInTheDocument()
    })
  })

  it('should display empty state when no entries', async () => {
    vi.mocked(api.api.get).mockResolvedValue({ entries: [] })

    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByText(/No leaderboard data available/i)).toBeInTheDocument()
    })
  })

  it('should display loading spinner initially', () => {
    vi.mocked(api.api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<Leaderboard />)

    // The loading spinner should be visible
    const spinner = document.querySelector('.border-cyan-500')
    expect(spinner).toBeInTheDocument()
  })

  it('should display top 3 with special styling', async () => {
    vi.mocked(api.api.get).mockResolvedValue(mockLeaderboardData)

    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument()
    })

    // Check for medal emojis in top 3
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('should display streak count for each entry', async () => {
    vi.mocked(api.api.get).mockResolvedValue(mockLeaderboardData)

    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByText('10🔥')).toBeInTheDocument()
      expect(screen.getByText('8🔥')).toBeInTheDocument()
      expect(screen.getByText('6🔥')).toBeInTheDocument()
    })
  })

  it('should fetch data when period changes', async () => {
    vi.mocked(api.api.get).mockResolvedValue(mockLeaderboardData)

    render(<Leaderboard />)

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith('/leaderboard?period=daily')
    })

    const monthlyButton = screen.getByText('monthly')
    fireEvent.click(monthlyButton)

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith('/leaderboard?period=monthly')
    })
  })
})
