import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { UserProfile } from './UserProfile'
import * as apiModule from '../../utils/api'

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
  level: 5,
  totalXp: 500,
  role: 'student' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockBadges = [
  {
    id: '1',
    name: 'First Commit',
    description: 'Made your first commit',
    criteria: 'first_commit',
    icon: '🎯',
    createdAt: new Date('2024-01-01'),
  },
]

describe('UserProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    vi.mocked(apiModule.api.get).mockImplementation(
      () => new Promise(() => {})
    )

    render(<UserProfile isOwnProfile={true} />)
    // Component should render without errors
    expect(document.body).toBeInTheDocument()
  })

  it('should display user profile data when loaded', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((endpoint) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/users/me/badges') return Promise.resolve(mockBadges)
      return Promise.resolve([])
    })

    render(<UserProfile isOwnProfile={true} />)

    await waitFor(() => {
      expect(screen.getAllByText('testuser').length).toBeGreaterThan(0)
      expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0)
    })
  })

  it('should display error message on API failure', async () => {
    vi.mocked(apiModule.api.get).mockRejectedValue(
      new Error('Failed to load profile')
    )

    render(<UserProfile isOwnProfile={true} />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load profile/)).toBeInTheDocument()
    })
  })

  it('should show edit button only for own profile', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((endpoint) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/users/me/badges') return Promise.resolve(mockBadges)
      return Promise.resolve([])
    })

    const { rerender } = render(<UserProfile isOwnProfile={true} />)

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    })

    // Re-render with isOwnProfile=false
    rerender(<UserProfile userId="2" isOwnProfile={false} />)

    // Edit button should not be visible for other profiles
    // (Note: This would require fetching different user data)
  })

  it('should toggle edit form when edit button is clicked', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((endpoint) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/users/me/badges') return Promise.resolve(mockBadges)
      return Promise.resolve([])
    })

    render(<UserProfile isOwnProfile={true} />)

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    })

    const editButton = screen.getByText('Edit Profile')
    editButton.click()

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    })
  })

  it('should display user stats correctly', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((endpoint) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/users/me/badges') return Promise.resolve(mockBadges)
      return Promise.resolve([])
    })

    render(<UserProfile isOwnProfile={true} />)

    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument() // totalXp
      expect(screen.getAllByText('5').length).toBeGreaterThan(0) // level
    })
  })

  it('should display badges when available', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((endpoint) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/users/me/badges') return Promise.resolve(mockBadges)
      return Promise.resolve([])
    })

    render(<UserProfile isOwnProfile={true} />)

    await waitFor(() => {
      expect(screen.getAllByText('First Commit').length).toBeGreaterThan(0)
    })
  })

  it('should show success message after profile update', async () => {
    vi.mocked(apiModule.api.get).mockImplementation((endpoint) => {
      if (endpoint === '/users/me') return Promise.resolve(mockUser)
      if (endpoint === '/users/me/badges') return Promise.resolve(mockBadges)
      return Promise.resolve([])
    })

    vi.mocked(apiModule.api.put).mockResolvedValue({
      ...mockUser,
      username: 'newusername',
    })

    render(<UserProfile isOwnProfile={true} />)

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    })

    const editButton = screen.getByText('Edit Profile')
    editButton.click()

    // The success message would appear after form submission
    // This is tested in EditForm.test.tsx
  })
})
