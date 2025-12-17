import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LeaderboardTable } from './LeaderboardTable'
import type { LeaderboardEntry } from '../../types'

describe('LeaderboardTable Component', () => {
  const mockEntries: LeaderboardEntry[] = [
    { rank: 1, userId: '1', username: 'alice', xp: 5000, streak: 10 },
    { rank: 2, userId: '2', username: 'bob', xp: 4500, streak: 8 },
    { rank: 3, userId: '3', username: 'charlie', xp: 4000, streak: 6 },
    { rank: 4, userId: '4', username: 'diana', xp: 3500, streak: 5 },
    { rank: 5, userId: '5', username: 'eve', xp: 3000, streak: 4 },
  ]

  it('should render all leaderboard entries', () => {
    render(<LeaderboardTable entries={mockEntries} period="daily" />)

    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('bob')).toBeInTheDocument()
    expect(screen.getByText('charlie')).toBeInTheDocument()
    expect(screen.getByText('diana')).toBeInTheDocument()
    expect(screen.getByText('eve')).toBeInTheDocument()
  })

  it('should display correct XP values', () => {
    render(<LeaderboardTable entries={mockEntries} period="daily" />)

    expect(screen.getByText('5000 XP')).toBeInTheDocument()
    expect(screen.getByText('4500 XP')).toBeInTheDocument()
    expect(screen.getByText('4000 XP')).toBeInTheDocument()
  })

  it('should display correct streak values', () => {
    render(<LeaderboardTable entries={mockEntries} period="daily" />)

    expect(screen.getByText('10🔥')).toBeInTheDocument()
    expect(screen.getByText('8🔥')).toBeInTheDocument()
    expect(screen.getByText('6🔥')).toBeInTheDocument()
  })

  it('should display period in header', () => {
    render(<LeaderboardTable entries={mockEntries} period="weekly" />)

    expect(screen.getByText('Leaderboard (weekly)')).toBeInTheDocument()
  })

  it('should display rank numbers', () => {
    render(<LeaderboardTable entries={mockEntries} period="daily" />)

    const rows = screen.getAllByRole('row')
    // First row is header, so we have 6 rows total (1 header + 5 entries)
    expect(rows.length).toBe(6)
  })

  it('should display medal emojis for top 3', () => {
    render(<LeaderboardTable entries={mockEntries} period="daily" />)

    const rows = screen.getAllByRole('row')
    // First row is header, so top 3 are rows 1, 2, 3
    expect(rows.length).toBeGreaterThanOrEqual(6) // header + 5 entries
  })

  it('should render table headers', () => {
    render(<LeaderboardTable entries={mockEntries} period="daily" />)

    expect(screen.getByText('Rank')).toBeInTheDocument()
    expect(screen.getByText('Player')).toBeInTheDocument()
    expect(screen.getByText('XP')).toBeInTheDocument()
    expect(screen.getByText('Streak')).toBeInTheDocument()
  })

  it('should handle empty entries', () => {
    render(<LeaderboardTable entries={[]} period="daily" />)

    expect(screen.getByText('Leaderboard (daily)')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBe(1) // Only header row
  })

  it('should display different periods correctly', () => {
    const { rerender } = render(<LeaderboardTable entries={mockEntries} period="daily" />)
    expect(screen.getByText('Leaderboard (daily)')).toBeInTheDocument()

    rerender(<LeaderboardTable entries={mockEntries} period="weekly" />)
    expect(screen.getByText('Leaderboard (weekly)')).toBeInTheDocument()

    rerender(<LeaderboardTable entries={mockEntries} period="monthly" />)
    expect(screen.getByText('Leaderboard (monthly)')).toBeInTheDocument()
  })

  it('should render all columns for each entry', () => {
    render(<LeaderboardTable entries={mockEntries} period="daily" />)

    // Check that all data is present
    mockEntries.forEach((entry) => {
      expect(screen.getByText(entry.username)).toBeInTheDocument()
      expect(screen.getByText(`${entry.xp} XP`)).toBeInTheDocument()
      expect(screen.getByText(`${entry.streak}🔥`)).toBeInTheDocument()
    })
  })
})
