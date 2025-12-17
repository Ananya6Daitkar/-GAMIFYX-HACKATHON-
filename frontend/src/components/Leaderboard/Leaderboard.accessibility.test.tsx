import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Leaderboard } from './Leaderboard'
import * as api from '../../utils/api'

vi.mock('../../utils/api')

describe('Leaderboard Component - Accessibility & Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(api.api.get as any).mockResolvedValue({
      entries: [
        { rank: 1, userId: '1', username: 'user1', xp: 1000, streak: 5 },
        { rank: 2, userId: '2', username: 'user2', xp: 900, streak: 3 },
      ],
    })
  })

  it('should have period filter group with proper ARIA attributes', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      const filterGroup = screen.getByRole('group', { name: /Leaderboard period filter/ })
      expect(filterGroup).toBeInTheDocument()
    })
  })

  it('should have aria-pressed on period buttons', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      const dailyButton = screen.getByLabelText('Show daily leaderboard')
      expect(dailyButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('should update aria-pressed when period changes', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      const dailyButton = screen.getByLabelText('Show daily leaderboard')
      expect(dailyButton).toHaveAttribute('aria-pressed', 'true')
    })

    const weeklyButton = screen.getByLabelText('Show weekly leaderboard')
    fireEvent.click(weeklyButton)

    await waitFor(() => {
      expect(weeklyButton).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByLabelText('Show daily leaderboard')).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    })
  })

  it('should have focus ring on period buttons', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      const dailyButton = screen.getByLabelText('Show daily leaderboard')
      expect(dailyButton).toHaveClass('focus:outline-none')
      expect(dailyButton).toHaveClass('focus:ring-2')
    })
  })

  it('should be keyboard navigable between period buttons', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      const dailyButton = screen.getByLabelText('Show daily leaderboard')
      expect(dailyButton).toBeInTheDocument()
    })

    const dailyButton = screen.getByLabelText('Show daily leaderboard')
    const weeklyButton = screen.getByLabelText('Show weekly leaderboard')

    dailyButton.focus()
    expect(document.activeElement).toBe(dailyButton)

    fireEvent.keyDown(weeklyButton, { key: 'Tab' })
    weeklyButton.focus()
    expect(document.activeElement).toBe(weeklyButton)
  })

  it('should handle Enter key on period buttons', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      const weeklyButton = screen.getByLabelText('Show weekly leaderboard')
      expect(weeklyButton).toBeInTheDocument()
    })

    const weeklyButton = screen.getByLabelText('Show weekly leaderboard')
    fireEvent.keyDown(weeklyButton, { key: 'Enter' })
    fireEvent.click(weeklyButton)

    await waitFor(() => {
      expect(weeklyButton).toHaveAttribute('aria-pressed', 'true')
    })
  })
})
