import React from 'react'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('should render with default size', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('w-12', 'h-12')
  })

  it('should render with small size', () => {
    render(<Spinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-6', 'h-6')
  })

  it('should render with large size', () => {
    render(<Spinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-16', 'h-16')
  })

  it('should have proper accessibility attributes', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading content')
    expect(spinner).toHaveAttribute('aria-busy', 'true')
  })

  it('should apply custom className', () => {
    render(<Spinner className="custom-class" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-class')
  })
})
