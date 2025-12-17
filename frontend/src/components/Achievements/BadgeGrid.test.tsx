import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BadgeGrid } from './BadgeGrid'
import * as apiModule from '../../utils/api'

vi.mock('../../utils/api')

const mockBadges = [
  {
    id: '1',
    name: 'First Submission',
    description: 'Submit your first code',
    criteria: 'Submit 1 code',
    icon: '🚀',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Level 5',
    description: 'Reach level 5',
    criteria: 'Reach level 5',
    icon: '⭐',
    createdAt: new Date(),
  },
]

const mockEarnedBadges = [
  {
    id: '1',
    name: 'First Submission',
    description: 'Submit your first code',
    criteria: 'Submit 1 code',
    icon: '🚀',
    createdAt: new Date(),
    earned: true,
    earnedAt: new Date(),
  },
]

describe('BadgeGrid Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading spinner initially', () => {
    vi.mocked(apiModule.api.get).mockImplementation(
      () => new Promise(() => {})
    )

    const { container } = render(<BadgeGrid />)
    const spinner = container.querySelector('[class*="border-cyan-500"]')
    expect(spinner).toBeInTheDocument()
  })

  it('should render all badges after loading', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((url) => {
      if (url === '/badges') return Promise.resolve(mockBadges)
      if (url === '/badges/earned') return Promise.resolve(mockEarnedBadges)
      return Promise.resolve([])
    })

    render(<BadgeGrid />)

    await waitFor(() => {
      expect(screen.getByText('🚀')).toBeInTheDocument()
      expect(screen.getByText('⭐')).toBeInTheDocument()
    })
  })

  it('should display earned and unearned badge count', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((url) => {
      if (url === '/badges') return Promise.resolve(mockBadges)
      if (url === '/badges/earned') return Promise.resolve(mockEarnedBadges)
      return Promise.resolve([])
    })

    render(<BadgeGrid />)

    await waitFor(() => {
      expect(screen.getByText(/1 of 2 badges earned/)).toBeInTheDocument()
    })
  })

  it('should render responsive grid layout', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((url) => {
      if (url === '/badges') return Promise.resolve(mockBadges)
      if (url === '/badges/earned') return Promise.resolve(mockEarnedBadges)
      return Promise.resolve([])
    })

    const { container } = render(<BadgeGrid />)

    await waitFor(() => {
      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toHaveClass('grid-cols-2')
      expect(grid).toHaveClass('sm:grid-cols-3')
      expect(grid).toHaveClass('md:grid-cols-4')
      expect(grid).toHaveClass('lg:grid-cols-6')
    })
  })

  it('should display error message on API failure', async () => {
    vi.mocked(apiModule.api.get).mockRejectedValue(
      new Error('API Error')
    )

    render(<BadgeGrid />)

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
    })
  })

  it('should display empty state when no badges available', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((url) => {
      if (url === '/badges') return Promise.resolve([])
      if (url === '/badges/earned') return Promise.resolve([])
      return Promise.resolve([])
    })

    render(<BadgeGrid />)

    await waitFor(() => {
      expect(
        screen.getByText(/No badges available yet/)
      ).toBeInTheDocument()
    })
  })

  it('should fetch badges for specific user when userId provided', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((url) => {
      if (url === '/badges') return Promise.resolve(mockBadges)
      if (url === '/users/user123/badges')
        return Promise.resolve(mockEarnedBadges)
      return Promise.resolve([])
    })

    render(<BadgeGrid userId="user123" />)

    await waitFor(() => {
      expect(apiModule.api.get).toHaveBeenCalledWith('/users/user123/badges')
    })
  })

  it('should display progress bar', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((url) => {
      if (url === '/badges') return Promise.resolve(mockBadges)
      if (url === '/badges/earned') return Promise.resolve(mockEarnedBadges)
      return Promise.resolve([])
    })

    const { container } = render(<BadgeGrid />)

    await waitFor(() => {
      const progressBar = container.querySelector('[class*="bg-gradient-to-r"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  it('should display achievements header', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((url) => {
      if (url === '/badges') return Promise.resolve(mockBadges)
      if (url === '/badges/earned') return Promise.resolve(mockEarnedBadges)
      return Promise.resolve([])
    })

    render(<BadgeGrid />)

    await waitFor(() => {
      expect(
        screen.getByText('Achievements & Badges')
      ).toBeInTheDocument()
    })
  })
})
