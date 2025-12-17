import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import * as api from '../../utils/api'

// Mock the API module
vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('Dashboard Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display user data after successful fetch', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      level: 5,
      totalXp: 1500,
      role: 'student' as const,
      avatar: 'https://example.com/avatar.jpg',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    vi.mocked(api.api.get).mockImplementation((endpoint: string) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/gamification/badges/earned') return Promise.resolve([])
      if (endpoint === '/users/me/streak') return Promise.resolve({ streak: 3 })
      return Promise.reject(new Error('Unknown endpoint'))
    })

    renderWithRouter(<Dashboard />)

    await waitFor(
      () => {
        expect(screen.getByText(/Welcome, testuser/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getAllByText('5').length).toBeGreaterThan(0) // Level
    expect(screen.getAllByText('1500').length).toBeGreaterThan(0) // XP
  })

  it('should display error message on API failure', async () => {
    vi.mocked(api.api.get).mockRejectedValue(
      new Error('Failed to load dashboard')
    )

    renderWithRouter(<Dashboard />)

    await waitFor(
      () => {
        expect(screen.getByText(/Failed to load dashboard/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should display stat cards with correct values', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      level: 10,
      totalXp: 5000,
      role: 'student' as const,
      avatar: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    vi.mocked(api.api.get).mockImplementation((endpoint: string) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/gamification/badges/earned')
        return Promise.resolve([{ id: '1' }, { id: '2' }])
      if (endpoint === '/users/me/streak') return Promise.resolve({ streak: 7 })
      return Promise.reject(new Error('Unknown endpoint'))
    })

    renderWithRouter(<Dashboard />)

    await waitFor(
      () => {
        expect(screen.getAllByText('5000').length).toBeGreaterThan(0) // XP
      },
      { timeout: 3000 }
    )
    expect(screen.getAllByText('10').length).toBeGreaterThan(0) // Level
    expect(screen.getAllByText('2').length).toBeGreaterThan(0) // Badges
    expect(screen.getAllByText('7').length).toBeGreaterThan(0) // Streak
  })

  it('should display hero section with user information', async () => {
    const mockUser = {
      id: '1',
      username: 'johndoe',
      email: 'john@example.com',
      level: 8,
      totalXp: 3200,
      role: 'student' as const,
      avatar: 'https://example.com/john.jpg',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    vi.mocked(api.api.get).mockImplementation((endpoint: string) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/gamification/badges/earned') return Promise.resolve([])
      if (endpoint === '/users/me/streak') return Promise.resolve({ streak: 5 })
      return Promise.reject(new Error('Unknown endpoint'))
    })

    renderWithRouter(<Dashboard />)

    await waitFor(
      () => {
        expect(screen.getByText(/Welcome, johndoe/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(screen.getAllByText('3200').length).toBeGreaterThan(0)
  })

  it('should display quick stats section', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      level: 5,
      totalXp: 1500,
      role: 'student' as const,
      avatar: undefined,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    }

    vi.mocked(api.api.get).mockImplementation((endpoint: string) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/gamification/badges/earned') return Promise.resolve([])
      if (endpoint === '/users/me/streak') return Promise.resolve({ streak: 0 })
      return Promise.reject(new Error('Unknown endpoint'))
    })

    renderWithRouter(<Dashboard />)

    await waitFor(
      () => {
        expect(screen.getByText(/Quick Stats/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(screen.getByText(/Total XP/i)).toBeInTheDocument()
    expect(screen.getByText(/Current Level/i)).toBeInTheDocument()
    expect(screen.getByText(/Member Since/i)).toBeInTheDocument()
  })

  it('should handle zero badges count', async () => {
    const mockUser = {
      id: '1',
      username: 'newuser',
      email: 'new@example.com',
      level: 1,
      totalXp: 0,
      role: 'student' as const,
      avatar: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    vi.mocked(api.api.get).mockImplementation((endpoint: string) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/gamification/badges/earned') return Promise.resolve([])
      if (endpoint === '/users/me/streak') return Promise.resolve({ streak: 0 })
      return Promise.reject(new Error('Unknown endpoint'))
    })

    renderWithRouter(<Dashboard />)

    await waitFor(
      () => {
        const badgeElements = screen.getAllByText('0')
        expect(badgeElements.length).toBeGreaterThan(0)
      },
      { timeout: 3000 }
    )
  })
})
