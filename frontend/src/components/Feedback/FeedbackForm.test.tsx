import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackForm } from './FeedbackForm'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'test-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('FeedbackForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render feedback form', () => {
    render(<FeedbackForm />)

    expect(screen.getByText('Send us your feedback')).toBeInTheDocument()
    expect(screen.getByLabelText('Category *')).toBeInTheDocument()
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument()
    expect(screen.getByLabelText('Message *')).toBeInTheDocument()
  })

  it('should submit feedback successfully', async () => {
    const mockOnSuccess = vi.fn()
    const user = userEvent.setup()

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        ticketNumber: 'TKT-ABC123-XYZ789',
        feedback: {
          id: 'feedback-1',
          category: 'technical',
          subject: 'Test Subject',
          message: 'Test message content',
        },
      }),
    } as Response)

    render(<FeedbackForm onSuccess={mockOnSuccess} />)

    // Fill form
    const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement
    await user.selectOptions(categorySelect, 'technical')

    const subjectInput = screen.getByLabelText('Subject *') as HTMLInputElement
    await user.type(subjectInput, 'Test Subject')

    const messageInput = screen.getByLabelText('Message *') as HTMLTextAreaElement
    await user.type(messageInput, 'Test message content here')

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i })
    await user.click(submitButton)

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Feedback Submitted!')).toBeInTheDocument()
    })

    expect(mockOnSuccess).toHaveBeenCalledWith('TKT-ABC123-XYZ789')
  })

  it('should show error on submission failure', async () => {
    const user = userEvent.setup()

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Failed to submit feedback',
      }),
    } as Response)

    render(<FeedbackForm />)

    // Fill form
    const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement
    await user.selectOptions(categorySelect, 'technical')

    const subjectInput = screen.getByLabelText('Subject *') as HTMLInputElement
    await user.type(subjectInput, 'Test Subject')

    const messageInput = screen.getByLabelText('Message *') as HTMLTextAreaElement
    await user.type(messageInput, 'Test message content here')

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i })
    await user.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to submit feedback')).toBeInTheDocument()
    })
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(<FeedbackForm />)

    // Try to submit without filling form
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i })
    await user.click(submitButton)

    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Please select a category')).toBeInTheDocument()
    })
  })

  it('should validate subject length', async () => {
    const user = userEvent.setup()

    render(<FeedbackForm />)

    const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement
    await user.selectOptions(categorySelect, 'technical')

    const subjectInput = screen.getByLabelText('Subject *') as HTMLInputElement
    await user.type(subjectInput, 'Hi')

    const messageInput = screen.getByLabelText('Message *') as HTMLTextAreaElement
    await user.type(messageInput, 'Test message content here')

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Subject must be at least 3 characters')).toBeInTheDocument()
    })
  })

  it('should validate message length', async () => {
    const user = userEvent.setup()

    render(<FeedbackForm />)

    const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement
    await user.selectOptions(categorySelect, 'technical')

    const subjectInput = screen.getByLabelText('Subject *') as HTMLInputElement
    await user.type(subjectInput, 'Test Subject')

    const messageInput = screen.getByLabelText('Message *') as HTMLTextAreaElement
    await user.type(messageInput, 'Short')

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument()
    })
  })

  it('should close form on cancel', async () => {
    const mockOnClose = vi.fn()
    const user = userEvent.setup()

    render(<FeedbackForm onClose={mockOnClose} />)

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
