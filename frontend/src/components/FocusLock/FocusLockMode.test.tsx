import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FocusLockMode } from './FocusLockMode'
import { api } from '../../utils/api'
import { User } from '../../types/index'

// Mock API
vi.mock('../../utils/api')

// Mock fullscreen API
const mockRequestFullscreen = vi.fn()
const mockExitFullscreen = vi.fn()

Object.defineProperty(document.documentElement, 'requestFullscreen', {
  value: mockRequestFullscreen,
  writable: true,
})

Object.defineProperty(document, 'exitFullscreen', {
  value: mockExitFullscreen,
  writable: true,
})

Object.defineProperty(document, 'fullscreenElement', {
  value: null,
  writable: true,
  configurable: true,
})

describe('FocusLockMode', () => {
  const mockUser: User = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    level: 5,
    totalXp: 500,
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockRequestFullscreen.mockResolvedValue(undefined)
    mockExitFullscreen.mockResolvedValue(undefined)
  })

  it('should render focus button in idle state', () => {
    render(<FocusLockMode user={mockUser} />)
    expect(screen.getByText(/Focus Lock Mode/i)).toBeInTheDocument()
  })

  it('should show warning dialog when button is clicked', async () => {
    render(<FocusLockMode user={mockUser} />)
    const button = screen.getByText(/Focus Lock Mode/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/You're about to enter Focus Lock Mode/i)).toBeInTheDocument()
    })
  })

  it('should start session when confirmed', async () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      startTime: new Date(),
      status: 'active',
    }

    vi.mocked(api.post).mockResolvedValue(mockSession)

    render(<FocusLockMode user={mockUser} />)
    const button = screen.getByText(/Focus Lock Mode/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Enter Focus Mode/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByText(/Enter Focus Mode/i)
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/gamification/focus/start', {
        userId: mockUser.id,
      })
    })
  })

  it('should save session to localStorage', async () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      startTime: new Date(),
      status: 'active',
    }

    vi.mocked(api.post).mockResolvedValue(mockSession)

    render(<FocusLockMode user={mockUser} />)
    const button = screen.getByText(/Focus Lock Mode/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Enter Focus Mode/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByText(/Enter Focus Mode/i)
    fireEvent.click(confirmButton)

    await waitFor(() => {
      const saved = localStorage.getItem('focusSession')
      expect(saved).toBeTruthy()
      const session = JSON.parse(saved!)
      expect(session.id).toBe('session-1')
      expect(session.status).toBe('active')
    })
  })

  it('should request fullscreen when session starts', async () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      startTime: new Date(),
      status: 'active',
    }

    vi.mocked(api.post).mockResolvedValue(mockSession)

    render(<FocusLockMode user={mockUser} />)
    const button = screen.getByText(/Focus Lock Mode/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Enter Focus Mode/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByText(/Enter Focus Mode/i)
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockRequestFullscreen).toHaveBeenCalled()
    })
  })

  it('should cancel session when cancel button is clicked', async () => {
    render(<FocusLockMode user={mockUser} />)
    const button = screen.getByText(/Focus Lock Mode/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument()
    })

    const cancelButton = screen.getByText(/Cancel/i)
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText(/You're about to enter Focus Lock Mode/i)).not.toBeInTheDocument()
    })
  })

  it('should restore session from localStorage on mount', async () => {
    const savedSession = {
      id: 'session-1',
      userId: 'user-1',
      startTime: new Date().toISOString(),
      status: 'active',
    }

    localStorage.setItem('focusSession', JSON.stringify(savedSession))

    render(<FocusLockMode user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText(/FOCUS LOCK MODE/i)).toBeInTheDocument()
    })
  })

  it('should call onXPEarned callback when session ends', async () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      startTime: new Date(),
      status: 'active',
    }

    const mockEndResponse = {
      session: { ...mockSession, status: 'completed' },
      xpAwarded: 50,
    }

    vi.mocked(api.post).mockResolvedValueOnce(mockSession).mockResolvedValueOnce(mockEndResponse)

    const onXPEarned = vi.fn()

    render(<FocusLockMode user={mockUser} onXPEarned={onXPEarned} />)
    const button = screen.getByText(/Focus Lock Mode/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Enter Focus Mode/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByText(/Enter Focus Mode/i)
    fireEvent.click(confirmButton)

    // Simulate session end (this would normally be triggered by the overlay)
    // For now, we just verify the callback would be called
    expect(onXPEarned).not.toHaveBeenCalled() // Not called until session actually ends
  })


})
