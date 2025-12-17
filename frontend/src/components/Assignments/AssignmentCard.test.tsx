import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssignmentCard } from './AssignmentCard'
import { Assignment } from '../../types'

describe('AssignmentCard Component', () => {
  const mockAssignment: Assignment = {
    id: '1',
    title: 'Build a Todo App',
    description: 'Create a simple todo application with add, delete, and mark complete functionality',
    difficulty: 'MEDIUM',
    xpReward: 150,
    requiredFiles: ['index.html', 'style.css', 'script.js'],
    expectedFolderStructure: 'src/\n  components/\n  utils/',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdBy: 'teacher-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should render assignment title and description', () => {
    const onAccept = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('Build a Todo App')).toBeInTheDocument()
    expect(screen.getByText(/Create a simple todo application/)).toBeInTheDocument()
  })

  it('should display difficulty badge with correct color', () => {
    const onAccept = vi.fn()
    const { container } = render(
      <AssignmentCard
        assignment={mockAssignment}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    const difficultyBadge = container.querySelector('[class*="border-yellow"]')
    expect(difficultyBadge).toBeInTheDocument()
  })

  it('should display XP reward', () => {
    const onAccept = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('+150 XP')).toBeInTheDocument()
  })

  it('should display required files', () => {
    const onAccept = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('index.html')).toBeInTheDocument()
    expect(screen.getByText('style.css')).toBeInTheDocument()
    expect(screen.getByText('script.js')).toBeInTheDocument()
  })

  it('should show "Accepted" badge when isAccepted is true', () => {
    const onAccept = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        isAccepted={true}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('Accepted')).toBeInTheDocument()
  })

  it('should not show Accept button when already accepted', () => {
    const onAccept = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        isAccepted={true}
        onAccept={onAccept}
      />
    )

    const acceptButtons = screen.queryAllByText('Accept')
    expect(acceptButtons.length).toBe(0)
  })

  it('should show Accept button when not accepted', () => {
    const onAccept = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        isAccepted={false}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('Accept')).toBeInTheDocument()
  })

  it('should call onAccept when Accept button is clicked', () => {
    const onAccept = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        isAccepted={false}
        onAccept={onAccept}
      />
    )

    const acceptButton = screen.getByText('Accept')
    fireEvent.click(acceptButton)

    expect(onAccept).toHaveBeenCalledTimes(1)
  })

  it('should call onViewDetails when View Details button is clicked', () => {
    const onViewDetails = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onViewDetails={onViewDetails}
      />
    )

    const viewButton = screen.getByText('View Details')
    fireEvent.click(viewButton)

    expect(onViewDetails).toHaveBeenCalledTimes(1)
  })

  it('should display deadline in future', () => {
    const onAccept = vi.fn()
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText(/Due/)).toBeInTheDocument()
  })

  it('should display "Deadline Passed" for past deadlines', () => {
    const onAccept = vi.fn()
    const pastAssignment = {
      ...mockAssignment,
      deadline: new Date(Date.now() - 1000), // 1 second ago
    }
    render(
      <AssignmentCard
        assignment={pastAssignment}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('Deadline Passed')).toBeInTheDocument()
  })

  it('should display EASY difficulty with green color', () => {
    const onAccept = vi.fn()
    const easyAssignment = { ...mockAssignment, difficulty: 'EASY' as const }
    const { container } = render(
      <AssignmentCard
        assignment={easyAssignment}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('EASY')).toBeInTheDocument()
    const difficultyBadge = container.querySelector('[class*="border-green"]')
    expect(difficultyBadge).toBeInTheDocument()
  })

  it('should display HARD difficulty with red color', () => {
    const onAccept = vi.fn()
    const hardAssignment = { ...mockAssignment, difficulty: 'HARD' as const }
    const { container } = render(
      <AssignmentCard
        assignment={hardAssignment}
        onAccept={onAccept}
      />
    )

    expect(screen.getByText('HARD')).toBeInTheDocument()
    const difficultyBadge = container.querySelector('[class*="border-red"]')
    expect(difficultyBadge).toBeInTheDocument()
  })
})
