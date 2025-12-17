import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { NotificationProvider } from '../../contexts/NotificationContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { User } from '../../types/index'

describe('Layout Component', () => {
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

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <NotificationProvider>
            {component}
          </NotificationProvider>
        </ThemeProvider>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('renders header and children', () => {
    renderWithProviders(
      <Layout user={mockUser}>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('GamifyX')).toBeInTheDocument() // Header only (sidebar hidden by default)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders sidebar on desktop', () => {
    renderWithProviders(
      <Layout user={mockUser}>
        <div>Test Content</div>
      </Layout>
    )
    
    // Sidebar is hidden by default, open it
    const menuButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(menuButton)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    renderWithProviders(
      <Layout user={mockUser}>
        <div>Test Content</div>
      </Layout>
    )

    // Sidebar is hidden by default, open it
    const menuButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(menuButton)

    const expectedLinks = [
      'Dashboard',
      'Leaderboard',
      'Achievements',
      'Submissions',
      'Analytics',
      'Focus Lock',
      'Teacher Dashboard',
      'Feedback',
      'Profile',
    ]

    expectedLinks.forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument()
    })
  })

  it('passes user data to header', () => {
    renderWithProviders(
      <Layout user={mockUser}>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('renders without user data', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('GamifyX')).toBeInTheDocument() // Header only (sidebar hidden by default)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('toggles sidebar when menu button is clicked', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    renderWithProviders(
      <Layout user={mockUser}>
        <div>Test Content</div>
      </Layout>
    )

    const menuButton = screen.getByLabelText('Toggle menu')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)
  })
})
