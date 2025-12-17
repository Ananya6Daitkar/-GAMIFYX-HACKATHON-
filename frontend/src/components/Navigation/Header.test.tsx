import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from './Header'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { User } from '../../types/index'

describe('Header Component', () => {
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    level: 5,
    totalXp: 1000,
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <ThemeProvider>{component}</ThemeProvider>
      </BrowserRouter>
    )
  }

  it('renders header with logo', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    expect(screen.getByText('GamifyX')).toBeInTheDocument()
  })

  it('renders user avatar when provided', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    const avatar = screen.getByAltText('testuser')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', mockUser.avatar)
  })

  it('renders user initial when avatar is not provided', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined }
    renderWithTheme(<Header user={userWithoutAvatar} isMobile={false} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('displays username on desktop', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('shows hamburger menu on mobile', () => {
    renderWithTheme(<Header user={mockUser} isMobile={true} />)
    const menuButton = screen.getByLabelText('Toggle menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('calls onMenuToggle when hamburger menu is clicked', () => {
    const onMenuToggle = vi.fn()
    renderWithTheme(<Header user={mockUser} isMobile={true} onMenuToggle={onMenuToggle} />)
    
    const menuButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(menuButton)
    expect(onMenuToggle).toHaveBeenCalled()
  })

  it('renders notifications bell', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    const notificationButton = screen.getByLabelText('Notifications')
    expect(notificationButton).toBeInTheDocument()
  })

  it('opens user menu when user button is clicked', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    fireEvent.click(userButton)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('displays user email in dropdown menu', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    fireEvent.click(userButton)
    
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
  })
})
