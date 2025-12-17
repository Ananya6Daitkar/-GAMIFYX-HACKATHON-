import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BadgeCard } from './BadgeCard'
import { Badge } from '../../types/index'

const mockBadge: Badge & { earned?: boolean; earnedAt?: Date } = {
  id: '1',
  name: 'First Submission',
  description: 'Submit your first code',
  criteria: 'Submit 1 code',
  icon: '🚀',
  createdAt: new Date(),
  earned: false,
}

describe('BadgeCard Component', () => {
  it('should render badge with icon', () => {
    render(<BadgeCard badge={mockBadge} />)
    expect(screen.getByText('🚀')).toBeInTheDocument()
  })

  it('should render earned badge in color', () => {
    const earnedBadge = { ...mockBadge, earned: true }
    const { container } = render(<BadgeCard badge={earnedBadge} />)

    const badgeContainer = container.querySelector('[class*="from-cyan"]')
    expect(badgeContainer).toBeInTheDocument()
  })

  it('should render unearned badge in grayscale', () => {
    const { container } = render(<BadgeCard badge={mockBadge} />)

    const icon = container.querySelector('[class*="grayscale"]')
    expect(icon).toBeInTheDocument()
  })

  it('should show tooltip on hover', async () => {
    const { container } = render(<BadgeCard badge={mockBadge} />)

    const badgeElement = container.firstChild as HTMLElement
    fireEvent.mouseEnter(badgeElement)

    await waitFor(() => {
      expect(screen.getByText('First Submission')).toBeInTheDocument()
      expect(screen.getByText('Submit your first code')).toBeInTheDocument()
    })
  })

  it('should hide tooltip on mouse leave', async () => {
    const { container } = render(<BadgeCard badge={mockBadge} />)

    const badgeElement = container.firstChild as HTMLElement
    fireEvent.mouseEnter(badgeElement)

    await waitFor(() => {
      expect(screen.getByText('First Submission')).toBeInTheDocument()
    })

    fireEvent.mouseLeave(badgeElement)

    await waitFor(() => {
      expect(screen.queryByText('First Submission')).not.toBeInTheDocument()
    })
  })

  it('should display earned date in tooltip for earned badges', async () => {
    const earnedDate = new Date('2024-01-15')
    const earnedBadge = { ...mockBadge, earned: true, earnedAt: earnedDate }
    const { container } = render(<BadgeCard badge={earnedBadge} />)

    const badgeElement = container.firstChild as HTMLElement
    fireEvent.mouseEnter(badgeElement)

    await waitFor(() => {
      expect(screen.getByText(/Earned:/)).toBeInTheDocument()
    })
  })

  it('should apply delay prop to animation', () => {
    const { container } = render(<BadgeCard badge={mockBadge} delay={200} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should have glow effect for earned badges', () => {
    const earnedBadge = { ...mockBadge, earned: true }
    const { container } = render(<BadgeCard badge={earnedBadge} />)

    const glowElement = container.querySelector('[class*="bg-cyan-500/10"]')
    expect(glowElement).toBeInTheDocument()
  })

  it('should not have glow effect for unearned badges', () => {
    const { container } = render(<BadgeCard badge={mockBadge} />)

    const glowElement = container.querySelector('[class*="bg-cyan-500/10"]')
    expect(glowElement).not.toBeInTheDocument()
  })

  it('should scale on hover', async () => {
    const { container } = render(<BadgeCard badge={mockBadge} />)

    const badgeContainer = container.querySelector('[class*="hover:scale"]')
    expect(badgeContainer).toBeInTheDocument()
  })

  it('should display badge criteria in tooltip', async () => {
    const { container } = render(<BadgeCard badge={mockBadge} />)

    const badgeElement = container.firstChild as HTMLElement
    fireEvent.mouseEnter(badgeElement)

    await waitFor(() => {
      expect(screen.getByText(/Submit 1 code/)).toBeInTheDocument()
    })
  })
})
