import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { NotificationProvider, useNotification } from '../../contexts/NotificationContext'
import { NotificationContainer } from './NotificationContainer'

const TestComponent = () => {
  const { addNotification } = useNotification()

  return (
    <div>
      <button onClick={() => addNotification('Test success', 'success')}>
        Add Success
      </button>
      <button onClick={() => addNotification('Test error', 'error')}>
        Add Error
      </button>
      <button onClick={() => addNotification('Test info', 'info')}>
        Add Info
      </button>
    </div>
  )
}

describe('NotificationContainer', () => {
  it('should render notifications when added', async () => {
    render(
      <NotificationProvider>
        <NotificationContainer />
        <TestComponent />
      </NotificationProvider>
    )

    const successButton = screen.getByText('Add Success')
    successButton.click()

    await waitFor(() => {
      expect(screen.getByText('Test success')).toBeInTheDocument()
    })
  })

  it('should have proper ARIA attributes', async () => {
    render(
      <NotificationProvider>
        <NotificationContainer />
        <TestComponent />
      </NotificationProvider>
    )

    const successButton = screen.getByText('Add Success')
    successButton.click()

    await waitFor(() => {
      const container = screen.getByRole('region', { name: 'Notifications' })
      expect(container).toHaveAttribute('aria-live', 'polite')
    })
  })

  it('should allow manual dismissal of notifications', async () => {
    render(
      <NotificationProvider>
        <NotificationContainer />
        <TestComponent />
      </NotificationProvider>
    )

    const successButton = screen.getByText('Add Success')
    successButton.click()

    await waitFor(() => {
      expect(screen.getByText('Test success')).toBeInTheDocument()
    })

    const closeButton = screen.getByLabelText(/Close success notification/)
    closeButton.click()

    await waitFor(() => {
      expect(screen.queryByText('Test success')).not.toBeInTheDocument()
    })
  })
})
