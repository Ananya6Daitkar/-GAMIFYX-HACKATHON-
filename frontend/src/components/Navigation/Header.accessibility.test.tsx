import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from './Header'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { User } from '../../types/index'

describe('Header Component - Accessibility & Keyboard Navigation', () => {
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

  it('should have focus ring on hamburger menu button', () => {
    renderWithTheme(<Header user={mockUser} isMobile={true} />)
    const menuButton = screen.getByLabelText('Toggle menu')
    expect(menuButton).toHaveClass('focus:ring-2')
  })

  it('should have focus ring on notifications button', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    const notificationButton = screen.getByLabelText('Notifications')
    expect(notificationButton).toHaveClass('focus:ring-2')
  })

  it('should have focus ring on user menu button', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    const userButton = screen.getByLabelText('User menu')
    expect(userButton).toHaveClass('focus:ring-2')
  })

  it('should close user menu on Escape key', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    fireEvent.click(userButton)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    
    fireEvent.keyDown(window, { key: 'Escape' })
    
    // Menu should be closed
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  it('should have proper ARIA attributes on user menu button', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    expect(userButton).toHaveAttribute('aria-haspopup', 'menu')
    expect(userButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should update aria-expanded when menu opens', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    expect(userButton).toHaveAttribute('aria-expanded', 'false')
    
    fireEvent.click(userButton)
    
    expect(userButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('should have focus ring on menu items', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    fireEvent.click(userButton)
    
    const profileLink = screen.getByText('Profile')
    expect(profileLink).toHaveClass('focus:ring-2')
  })

  it('should have role="menu" on dropdown', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    fireEvent.click(userButton)
    
    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()
  })

  it('should have role="menuitem" on menu items', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    fireEvent.click(userButton)
    
    const menuItems = screen.getAllByRole('menuitem')
    expect(menuItems.length).toBeGreaterThan(0)
  })

  it('should close menu when clicking outside', () => {
    renderWithTheme(<Header user={mockUser} isMobile={false} />)
    
    const userButton = screen.getByLabelText('User menu')
    fireEvent.click(userButton)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    
    fireEvent.mouseDown(document.body)
    
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })
})
