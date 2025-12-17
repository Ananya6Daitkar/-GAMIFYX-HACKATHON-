import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toast } from './Toast'
import { Notification } from '../../contexts/NotificationContext'

describe('Toast Component - Accessibility', () => {
  const mockNotification: Notification = {
    id: '1',
    type: 'success',
    message: 'Operation successful',
    duration: 5000,
  }

  it('should have proper ARIA attributes for success notification', () => {
    const onClose = vi.fn()
    render(<Toast notification={mockNotification} onClose={onClose} />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'polite')
    expect(toast).toHaveAttribute('aria-atomic', 'true')
  })

  it('should have assertive aria-live for error notifications', () => {
    const errorNotification: Notification = {
      ...mockNotification,
      type: 'error',
      message: 'An error occurred',
    }
    const onClose = vi.fn()
    render(<Toast notification={errorNotification} onClose={onClose} />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'assertive')
  })

  it('should have accessible close button', () => {
    const onClose = vi.fn()
    render(<Toast notification={mockNotification} onClose={onClose} />)

    const closeButton = screen.getByLabelText(/Close success notification/)
    expect(closeButton).toBeInTheDocument()
  })

  it('should close notification when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Toast notification={mockNotification} onClose={onClose} />)

    const closeButton = screen.getByLabelText(/Close success notification/)
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledWith(mockNotification.id)
  })

  it('should be keyboard accessible', () => {
    const onClose = vi.fn()
    render(<Toast notification={mockNotification} onClose={onClose} />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('tabIndex', '0')
  })

  it('should have focus ring on close button', () => {
    const onClose = vi.fn()
    render(<Toast notification={mockNotification} onClose={onClose} />)

    const closeButton = screen.getByLabelText(/Close success notification/)
    expect(closeButton).toHaveClass('focus:ring-2')
  })

  it('should display notification message', () => {
    const onClose = vi.fn()
    render(<Toast notification={mockNotification} onClose={onClose} />)

    expect(screen.getByText('Operation successful')).toBeInTheDocument()
  })

  it('should auto-dismiss after duration', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const { unmount } = render(
      <Toast notification={mockNotification} onClose={onClose} />
    )

    vi.advanceTimersByTime(5000)

    expect(onClose).toHaveBeenCalledWith(mockNotification.id)

    vi.useRealTimers()
    unmount()
  })
})
