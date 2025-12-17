import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Competitions } from './Competitions'
import * as api from '../../utils/api'

vi.mock('../../utils/api')

const mockCompetitions = [
  {
    id: '1',
    title: 'React Challenge',
    description: 'Build a React component',
    difficulty: 'MEDIUM' as const,
    rules: 'Follow best practices',
    requirements: 'Use TypeScript',
    xpReward: 100,
    startTime: new Date(Date.now() - 1000000),
    endTime: new Date(Date.now() + 1000000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Algorithm Challenge',
    description: 'Solve algorithms',
    difficulty: 'HARD' as const,
    rules: 'Optimize for time complexity',
    requirements: 'O(n) solution required',
    xpReward: 200,
    startTime: new Date(Date.now() - 2000000),
    endTime: new Date(Date.now() - 1000000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('Competitions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders competitions list', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({ competitions: mockCompetitions })
    vi.mocked(api.api.get).mockResolvedValueOnce({ participations: [] })

    render(<Competitions />)

    await waitFor(() => {
      expect(screen.getByText('React Challenge')).toBeInTheDocument()
      expect(screen.getByText('Algorithm Challenge')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    vi.mocked(api.api.get).mockImplementationOnce(() => new Promise(() => {}))
    vi.mocked(api.api.get).mockImplementationOnce(() => new Promise(() => {}))

    render(<Competitions />)

    // Check for loading spinner by looking for the border element
    const loadingSpinner = document.querySelector('.border-cyan-500')
    expect(loadingSpinner).toBeInTheDocument()
  })

  it('displays error state on fetch failure', async () => {
    vi.mocked(api.api.get).mockRejectedValueOnce(new Error('Failed to load'))

    render(<Competitions />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    })
  })

  it('filters competitions by active status', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({ competitions: mockCompetitions })
    vi.mocked(api.api.get).mockResolvedValueOnce({ participations: [] })

    render(<Competitions />)

    await waitFor(() => {
      expect(screen.getByText('React Challenge')).toBeInTheDocument()
    })

    const activeButton = screen.getByRole('button', { name: /active/i })
    fireEvent.click(activeButton)

    await waitFor(() => {
      expect(screen.getByText('React Challenge')).toBeInTheDocument()
      expect(screen.queryByText('Algorithm Challenge')).not.toBeInTheDocument()
    })
  })

  it('filters competitions by ended status', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({ competitions: mockCompetitions })
    vi.mocked(api.api.get).mockResolvedValueOnce({ participations: [] })

    render(<Competitions />)

    await waitFor(() => {
      expect(screen.getByText('React Challenge')).toBeInTheDocument()
    })

    const endedButton = screen.getByRole('button', { name: /ended/i })
    fireEvent.click(endedButton)

    await waitFor(() => {
      expect(screen.queryByText('React Challenge')).not.toBeInTheDocument()
      expect(screen.getByText('Algorithm Challenge')).toBeInTheDocument()
    })
  })

  it('handles join competition', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({ competitions: mockCompetitions })
    vi.mocked(api.api.get).mockResolvedValueOnce({ participations: [] })
    vi.mocked(api.api.post).mockResolvedValueOnce({ message: 'Joined' })

    render(<Competitions />)

    await waitFor(() => {
      expect(screen.getByText('React Challenge')).toBeInTheDocument()
    })

    const joinButtons = screen.getAllByRole('button', { name: /join/i })
    fireEvent.click(joinButtons[0])

    await waitFor(() => {
      expect(api.api.post).toHaveBeenCalledWith('/competitions/1/join', {})
    })
  })

  it('displays joined status for participating competitions', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({ competitions: mockCompetitions })
    vi.mocked(api.api.get).mockResolvedValueOnce({ participations: [{ competitionId: '1' }] })

    render(<Competitions />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /joined/i })).toBeInTheDocument()
    })
  })

  it('displays empty state when no competitions', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({ competitions: [] })
    vi.mocked(api.api.get).mockResolvedValueOnce({ participations: [] })

    render(<Competitions />)

    await waitFor(() => {
      expect(screen.getByText(/No.*competitions available/i)).toBeInTheDocument()
    })
  })
})
