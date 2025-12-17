import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssignmentList } from './AssignmentList'
import { StudentAssignment, Assignment } from '../../types'

describe('AssignmentList Component', () => {
  const mockAssignment: Assignment = {
    id: '1',
    title: 'Build a Todo App',
    description: 'Create a simple todo application',
    difficulty: 'MEDIUM',
    xpReward: 150,
    requiredFiles: ['index.html', 'style.css', 'script.js'],
    expectedFolderStructure: 'src/',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: 'teacher-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockStudentAssignment: StudentAssignment = {
    assignment: mockAssignment,
    accepted: false,
  }

  it('should render empty state when no assignments', () => {
    render(<AssignmentList assignments={[]} />)

    expect(screen.getByText('No Assignments Available')).toBeInTheDocument()
    expect(screen.getByText(/Check back later/)).toBeInTheDocument()
  })

  it('should render assignment cards for each assignment', () => {
    const assignments = [mockStudentAssignment, mockStudentAssignment]
    render(<AssignmentList assignments={assignments} />)

    const titles = screen.getAllByText('Build a Todo App')
    expect(titles).toHaveLength(2)
  })

  it('should call onViewDetails when View Details is clicked', () => {
    const onViewDetails = vi.fn()
    render(
      <AssignmentList
        assignments={[mockStudentAssignment]}
        onViewDetails={onViewDetails}
      />
    )

    const viewButton = screen.getByText('View Details')
    fireEvent.click(viewButton)

    expect(onViewDetails).toHaveBeenCalledWith(mockAssignment)
  })

  it('should show Accept button for unaccepted assignments', () => {
    render(
      <AssignmentList
        assignments={[mockStudentAssignment]}
      />
    )

    expect(screen.getByText('Accept')).toBeInTheDocument()
  })

  it('should show Accepted badge for accepted assignments', () => {
    const acceptedAssignment: StudentAssignment = {
      ...mockStudentAssignment,
      accepted: true,
      acceptedAt: new Date(),
    }
    render(
      <AssignmentList
        assignments={[acceptedAssignment]}
      />
    )

    expect(screen.getByText('Accepted')).toBeInTheDocument()
  })

  it('should render multiple assignments in grid layout', () => {
    const assignments = [
      mockStudentAssignment,
      {
        ...mockStudentAssignment,
        assignment: { ...mockAssignment, id: '2', title: 'Build a Chat App' },
      },
      {
        ...mockStudentAssignment,
        assignment: { ...mockAssignment, id: '3', title: 'Build a Blog' },
      },
    ]
    render(<AssignmentList assignments={assignments} />)

    expect(screen.getByText('Build a Todo App')).toBeInTheDocument()
    expect(screen.getByText('Build a Chat App')).toBeInTheDocument()
    expect(screen.getByText('Build a Blog')).toBeInTheDocument()
  })

  it('should display assignment metadata correctly', () => {
    render(
      <AssignmentList
        assignments={[mockStudentAssignment]}
      />
    )

    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    expect(screen.getByText('+150 XP')).toBeInTheDocument()
  })
})
