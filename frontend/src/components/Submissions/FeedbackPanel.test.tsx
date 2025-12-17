import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeedbackPanel } from './FeedbackPanel'
import { AIFeedback } from '../../types'

describe('FeedbackPanel Component', () => {
  const mockFeedback: AIFeedback = {
    id: 'feedback-1',
    submissionId: '1',
    insights: ['Good variable naming', 'Consider adding comments'],
    confidenceScore: 85,
    codeReferences: [
      {
        lineNumber: 1,
        snippet: 'const x = 5;',
        suggestion: 'Use descriptive names',
      },
    ],
    generatedAt: new Date('2024-01-15'),
  }

  it('should display confidence score', () => {
    render(<FeedbackPanel feedback={mockFeedback} />)
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('should display high confidence label for score >= 80', () => {
    render(<FeedbackPanel feedback={mockFeedback} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('should display medium confidence label for score 60-79', () => {
    const feedback = { ...mockFeedback, confidenceScore: 70 }
    render(<FeedbackPanel feedback={feedback} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('should display low confidence label for score < 60', () => {
    const feedback = { ...mockFeedback, confidenceScore: 45 }
    render(<FeedbackPanel feedback={feedback} />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('should show disclaimer for low confidence', () => {
    const feedback = { ...mockFeedback, confidenceScore: 45 }
    render(<FeedbackPanel feedback={feedback} />)
    expect(screen.getByText(/lower confidence/i)).toBeInTheDocument()
  })

  it('should not show disclaimer for high confidence', () => {
    render(<FeedbackPanel feedback={mockFeedback} />)
    const disclaimer = screen.queryByText(/lower confidence/i)
    expect(disclaimer).not.toBeInTheDocument()
  })

  it('should display all insights', () => {
    render(<FeedbackPanel feedback={mockFeedback} />)
    expect(screen.getByText('Good variable naming')).toBeInTheDocument()
    expect(screen.getByText('Consider adding comments')).toBeInTheDocument()
  })

  it('should display code references', () => {
    render(<FeedbackPanel feedback={mockFeedback} />)
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText(/const x = 5;/)).toBeInTheDocument()
  })

  it('should display suggestion for code reference', () => {
    render(<FeedbackPanel feedback={mockFeedback} />)
    expect(screen.getByText('Use descriptive names')).toBeInTheDocument()
  })

  it('should display generated date', () => {
    render(<FeedbackPanel feedback={mockFeedback} />)
    expect(screen.getByText(/Generated/)).toBeInTheDocument()
  })

  it('should handle multiple code references', () => {
    const feedback = {
      ...mockFeedback,
      codeReferences: [
        {
          lineNumber: 1,
          snippet: 'const x = 5;',
          suggestion: 'Use descriptive names',
        },
        {
          lineNumber: 2,
          snippet: 'console.log(x);',
          suggestion: 'Add error handling',
        },
      ],
    }
    render(<FeedbackPanel feedback={feedback} />)
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
  })

  it('should handle empty insights', () => {
    const feedback = { ...mockFeedback, insights: [] }
    render(<FeedbackPanel feedback={feedback} />)
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('should handle empty code references', () => {
    const feedback = { ...mockFeedback, codeReferences: [] }
    render(<FeedbackPanel feedback={feedback} />)
    expect(screen.getByText('Confidence Score')).toBeInTheDocument()
  })
})
