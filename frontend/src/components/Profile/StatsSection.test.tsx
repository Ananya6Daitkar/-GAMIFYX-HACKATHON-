import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsSection } from './StatsSection'
import { User, Badge } from '../../types/index'

const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
  level: 5,
  totalXp: 500,
  role: 'student',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Commit',
    description: 'Made your first commit',
    criteria: 'first_commit',
    icon: '🏅',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Code Master',
    description: 'Achieved 10 passing submissions',
    criteria: 'ten_passes',
    icon: '🏅',
    createdAt: new Date('2024-01-01'),
  },
]

describe('StatsSection Component', () => {
  it('should display total XP', () => {
    render(<StatsSection user={mockUser} badges={[]} />)

    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('Total XP')).toBeInTheDocument()
  })

  it('should display current level', () => {
    render(<StatsSection user={mockUser} badges={[]} />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Level')).toBeInTheDocument()
  })

  it('should display badge count', () => {
    render(<StatsSection user={mockUser} badges={mockBadges} />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Badges')).toBeInTheDocument()
  })

  it('should display zero badges when none earned', () => {
    render(<StatsSection user={mockUser} badges={[]} />)

    const badgeElements = screen.getAllByText('0')
    expect(badgeElements.length).toBeGreaterThan(0)
  })

  it('should display earned badges grid', () => {
    render(<StatsSection user={mockUser} badges={mockBadges} />)

    expect(screen.getByText('Earned Badges')).toBeInTheDocument()
    // Badges appear in both grid and tooltip, so check for multiple occurrences
    const firstCommitElements = screen.getAllByText('First Commit')
    expect(firstCommitElements.length).toBeGreaterThan(0)
  })

  it('should not display badges section when no badges', () => {
    render(<StatsSection user={mockUser} badges={[]} />)

    expect(screen.queryByText('Earned Badges')).not.toBeInTheDocument()
  })

  it('should display account information section', () => {
    render(<StatsSection user={mockUser} badges={[]} />)

    expect(screen.getByText('Account Information')).toBeInTheDocument()
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should display user role in account info', () => {
    render(<StatsSection user={mockUser} badges={[]} />)

    expect(screen.getByText('student')).toBeInTheDocument()
  })

  it('should display member since date', () => {
    render(<StatsSection user={mockUser} badges={[]} />)

    expect(screen.getByText(/Member Since/)).toBeInTheDocument()
  })

  it('should calculate progress to next level correctly', () => {
    const userWith50XP = { ...mockUser, totalXp: 50 }
    render(<StatsSection user={userWith50XP} badges={[]} />)

    // 50 XP out of 100 = 50% to next level
    expect(screen.getByText(/50%/)).toBeInTheDocument()
  })

  it('should display badge icons', () => {
    render(<StatsSection user={mockUser} badges={mockBadges} />)

    // Badges should be rendered with default icon if not provided
    const badgeElements = screen.getAllByText(/🏅/)
    expect(badgeElements.length).toBeGreaterThan(0)
  })

  it('should display multiple badges in grid', () => {
    const manyBadges = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      name: `Badge ${i}`,
      description: `Description ${i}`,
      criteria: `criteria_${i}`,
      icon: '🏅',
      createdAt: new Date('2024-01-01'),
    }))

    render(<StatsSection user={mockUser} badges={manyBadges} />)

    expect(screen.getByText('Earned Badges')).toBeInTheDocument()
    // Check that badges are rendered - should have at least 10 badge elements
    const badgeElements = screen.getAllByText(/Badge \d+/)
    expect(badgeElements.length).toBeGreaterThanOrEqual(10)
  })

  it('should display XP in localized format', () => {
    const userWithLargeXP = { ...mockUser, totalXp: 1000000 }
    render(<StatsSection user={userWithLargeXP} badges={[]} />)

    // Should display with comma separator
    expect(screen.getByText('1,000,000')).toBeInTheDocument()
  })
})
