import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

describe('Sidebar Component', () => {
  const mockLinks = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { label: 'Achievements', href: '/achievements', icon: '⭐' },
  ]

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('renders sidebar with logo', () => {
    renderWithRouter(<Sidebar links={mockLinks} isOpen={true} />)
    expect(screen.getByText('GamifyX')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    renderWithRouter(<Sidebar links={mockLinks} isOpen={true} />)
    
    mockLinks.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument()
    })
  })

  it('renders link icons', () => {
    renderWithRouter(<Sidebar links={mockLinks} isOpen={true} />)
    
    mockLinks.forEach((link) => {
      expect(screen.getByText(link.icon)).toBeInTheDocument()
    })
  })

  it('renders links with correct href attributes', () => {
    renderWithRouter(<Sidebar links={mockLinks} isOpen={true} />)
    
    mockLinks.forEach((link) => {
      const linkElement = screen.getByText(link.label).closest('a')
      expect(linkElement).toHaveAttribute('href', link.href)
    })
  })

  it('calls onClose when a link is clicked', () => {
    const onClose = vi.fn()
    renderWithRouter(<Sidebar links={mockLinks} isOpen={true} onClose={onClose} />)
    
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    fireEvent.click(dashboardLink!)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose if onClose is not provided', () => {
    renderWithRouter(<Sidebar links={mockLinks} isOpen={true} />)
    
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    // Should not throw error
    fireEvent.click(dashboardLink!)
  })

  it('renders empty sidebar when no links provided', () => {
    render(<Sidebar links={[]} isOpen={true} />)
    expect(screen.getByText('GamifyX')).toBeInTheDocument()
  })
})
