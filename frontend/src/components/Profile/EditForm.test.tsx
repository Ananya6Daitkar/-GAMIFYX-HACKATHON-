import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditForm } from './EditForm'
import { User } from '../../types/index'

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

describe('EditForm Component', () => {
  let onSave: ReturnType<typeof vi.fn>
  let onCancel: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSave = vi.fn().mockResolvedValue(undefined)
    onCancel = vi.fn()
  })

  it('should render form with user data', () => {
    render(
      <EditForm user={mockUser} onSave={onSave} onCancel={onCancel} />
    )

    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
  })

  it('should render edit form title', () => {
    render(
      <EditForm user={mockUser} onSave={onSave} onCancel={onCancel} />
    )

    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  it('should render save and cancel buttons', () => {
    render(
      <EditForm user={mockUser} onSave={onSave} onCancel={onCancel} />
    )

    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <EditForm user={mockUser} onSave={onSave} onCancel={onCancel} />
    )

    screen.getByText('Cancel').click()

    expect(onCancel).toHaveBeenCalled()
  })

  it('should render avatar upload section', () => {
    render(
      <EditForm user={mockUser} onSave={onSave} onCancel={onCancel} />
    )

    expect(screen.getByText(/JPG or PNG/)).toBeInTheDocument()
  })

  it('should render form labels', () => {
    render(
      <EditForm user={mockUser} onSave={onSave} onCancel={onCancel} />
    )

    expect(screen.getByText('Avatar')).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should have input fields for username and email', () => {
    render(
      <EditForm user={mockUser} onSave={onSave} onCancel={onCancel} />
    )

    const usernameInput = screen.getByDisplayValue('testuser') as HTMLInputElement
    const emailInput = screen.getByDisplayValue('test@example.com') as HTMLInputElement

    expect(usernameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(usernameInput.type).toBe('text')
    expect(emailInput.type).toBe('email')
  })
})
