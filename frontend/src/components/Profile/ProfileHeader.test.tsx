import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileHeader } from './ProfileHeader'
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

describe('ProfileHeader Component', () => {
  it('should display user information', () => {
    const onEditToggle = vi.fn()
    render(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={true}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // level
  })

  it('should display user avatar', () => {
    const onEditToggle = vi.fn()
    render(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={true}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    const avatar = screen.getByAltText('testuser')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('should display initials when no avatar', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined }
    const onEditToggle = vi.fn()

    render(
      <ProfileHeader
        user={userWithoutAvatar}
        isOwnProfile={true}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    expect(screen.getByText('T')).toBeInTheDocument() // First letter of username
  })

  it('should display role badge', () => {
    const onEditToggle = vi.fn()
    render(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={true}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    expect(screen.getByText('Student')).toBeInTheDocument()
  })

  it('should display member since date', () => {
    const onEditToggle = vi.fn()
    render(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={true}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    expect(screen.getByText(/Member since/)).toBeInTheDocument()
  })

  it('should show edit button for own profile', () => {
    const onEditToggle = vi.fn()
    render(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={true}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  it('should not show edit button for other profiles', () => {
    const onEditToggle = vi.fn()
    render(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={false}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument()
  })

  it('should call onEditToggle when edit button is clicked', () => {
    const onEditToggle = vi.fn()

    render(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={true}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    const editButton = screen.getByText('Edit Profile')
    editButton.click()
    expect(onEditToggle).toHaveBeenCalled()
  })

  it('should show cancel button when editing', () => {
    const onEditToggle = vi.fn()
    render(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={true}
        isEditing={true}
        onEditToggle={onEditToggle}
      />
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should display teacher role correctly', () => {
    const teacherUser = { ...mockUser, role: 'teacher' as const }
    const onEditToggle = vi.fn()

    render(
      <ProfileHeader
        user={teacherUser}
        isOwnProfile={true}
        isEditing={false}
        onEditToggle={onEditToggle}
      />
    )

    expect(screen.getByText('Teacher')).toBeInTheDocument()
  })
})
