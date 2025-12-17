import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CompetitionCard } from './CompetitionCard'
import type { Competition } from '../../types'

const mockCompetition: Competition = {
  id: '1',
  title: 'React Challenge',
  description: 'Build a React component',
  difficulty: 'MEDIUM',
  rules: 'Follow best practices',
  requirements: 'Use TypeScript',
  xpReward: 100,
  startTime: new Date(Date.now() - 1000000),
  endTime: new Date(Date.now() + 1000000),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('CompetitionCard Component', () => {
  it('renders competition title and description', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    expect(screen.getByText('React Challenge')).toBeInTheDocument()
    expect(screen.getByText('Build a React component')).toBeInTheDocument()
  })

  it('displays difficulty badge', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
  })

  it('displays XP reward', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    expect(screen.getByText('100 XP')).toBeInTheDocument()
  })

  it('shows join button when not participating', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    const joinButton = screen.getByRole('button', { name: /join/i })
    expect(joinButton).toBeInTheDocument()
  })

  it('shows joined button when participating', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={true}
      />
    )

    const joinedButton = screen.getByRole('button', { name: /joined/i })
    expect(joinedButton).toBeInTheDocument()
    expect(joinedButton).toBeDisabled()
  })

  it('calls onJoin when join button clicked', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    const joinButton = screen.getByRole('button', { name: /join/i })
    fireEvent.click(joinButton)

    expect(mockOnJoin).toHaveBeenCalledWith('1')
  })

  it('calls onViewDetails when details button clicked', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    const detailsButton = screen.getByRole('button', { name: /details/i })
    fireEvent.click(detailsButton)

    expect(mockOnViewDetails).toHaveBeenCalledWith('1')
  })

  it('displays timer for active competitions', async () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Time Remaining/i)).toBeInTheDocument()
    })
  })

  it('displays ended status for inactive competitions', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()

    render(
      <CompetitionCard
        competition={mockCompetition}
        isActive={false}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    expect(screen.getByText('Ended')).toBeInTheDocument()
  })

  it('applies correct difficulty color for EASY', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()
    const easyCompetition = { ...mockCompetition, difficulty: 'EASY' as const }

    render(
      <CompetitionCard
        competition={easyCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    const badge = screen.getByText('EASY')
    expect(badge).toHaveClass('bg-green-500/20')
  })

  it('applies correct difficulty color for HARD', () => {
    const mockOnJoin = vi.fn()
    const mockOnViewDetails = vi.fn()
    const hardCompetition = { ...mockCompetition, difficulty: 'HARD' as const }

    render(
      <CompetitionCard
        competition={hardCompetition}
        isActive={true}
        onJoin={mockOnJoin}
        onViewDetails={mockOnViewDetails}
        isParticipating={false}
      />
    )

    const badge = screen.getByText('HARD')
    expect(badge).toHaveClass('bg-red-500/20')
  })
})
