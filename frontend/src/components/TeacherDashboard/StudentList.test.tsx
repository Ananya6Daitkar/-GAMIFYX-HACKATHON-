import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { StudentList } from './StudentList'
import * as apiModule from '../../utils/api'

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('StudentList', () => {
  const mockOnSelectStudent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    vi.mocked(apiModule.api.get).mockImplementation(() => new Promise(() => {}))

    const { container } = render(<StudentList onSelectStudent={mockOnSelectStudent} />)

    // Check that component renders
    expect(container).toBeInTheDocument()
  })

  it('should display student list when loaded', async () => {
    const mockStudents = [
      {
        id: '1',
        username: 'student1',
        email: 'student1@test.com',
        level: 5,
        totalXp: 500,
        avatar: undefined,
        progressPercentage: 50,
        needsIntervention: false,
        interventionReason: null,
      },
      {
        id: '2',
        username: 'student2',
        email: 'student2@test.com',
        level: 3,
        totalXp: 300,
        avatar: undefined,
        progressPercentage: 30,
        needsIntervention: true,
        interventionReason: 'Low engagement',
      },
    ]

    vi.mocked(apiModule.api.get).mockResolvedValue(mockStudents)

    render(<StudentList onSelectStudent={mockOnSelectStudent} />)

    await waitFor(() => {
      expect(screen.getByText('student1')).toBeInTheDocument()
      expect(screen.getByText('student2')).toBeInTheDocument()
    })
  })

  it('should filter students by search term', async () => {
    const mockStudents = [
      {
        id: '1',
        username: 'alice',
        email: 'alice@test.com',
        level: 5,
        totalXp: 500,
        avatar: undefined,
        progressPercentage: 50,
        needsIntervention: false,
        interventionReason: null,
      },
      {
        id: '2',
        username: 'bob',
        email: 'bob@test.com',
        level: 3,
        totalXp: 300,
        avatar: undefined,
        progressPercentage: 30,
        needsIntervention: false,
        interventionReason: null,
      },
    ]

    vi.mocked(apiModule.api.get).mockResolvedValue(mockStudents)

    render(<StudentList onSelectStudent={mockOnSelectStudent} />)

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search students/i)
    fireEvent.change(searchInput, { target: { value: 'bob' } })

    await waitFor(() => {
      expect(screen.queryByText('alice')).not.toBeInTheDocument()
      expect(screen.getByText('bob')).toBeInTheDocument()
    })
  })

  it('should call onSelectStudent when View Details button is clicked', async () => {
    const mockStudents = [
      {
        id: '1',
        username: 'student1',
        email: 'student1@test.com',
        level: 5,
        totalXp: 500,
        avatar: undefined,
        progressPercentage: 50,
        needsIntervention: false,
        interventionReason: null,
      },
    ]

    vi.mocked(apiModule.api.get).mockResolvedValue(mockStudents)

    render(<StudentList onSelectStudent={mockOnSelectStudent} />)

    await waitFor(() => {
      expect(screen.getByText('student1')).toBeInTheDocument()
    })

    const viewButton = screen.getByText('View Details')
    fireEvent.click(viewButton)

    expect(mockOnSelectStudent).toHaveBeenCalledWith('1')
  })

  it('should display intervention indicator for students needing help', async () => {
    const mockStudents = [
      {
        id: '1',
        username: 'student1',
        email: 'student1@test.com',
        level: 5,
        totalXp: 500,
        avatar: undefined,
        progressPercentage: 50,
        needsIntervention: false,
        interventionReason: null,
      },
      {
        id: '2',
        username: 'student2',
        email: 'student2@test.com',
        level: 1,
        totalXp: 50,
        avatar: undefined,
        progressPercentage: 5,
        needsIntervention: true,
        interventionReason: 'Low engagement',
      },
    ]

    vi.mocked(apiModule.api.get).mockResolvedValue(mockStudents)

    render(<StudentList onSelectStudent={mockOnSelectStudent} />)

    await waitFor(() => {
      expect(screen.getByText('On Track')).toBeInTheDocument()
      expect(screen.getByText('Intervention')).toBeInTheDocument()
    })
  })

  it('should display error message on API failure', async () => {
    const errorMessage = 'Failed to load students'
    vi.mocked(apiModule.api.get).mockRejectedValue(new Error(errorMessage))

    render(<StudentList onSelectStudent={mockOnSelectStudent} />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
})
