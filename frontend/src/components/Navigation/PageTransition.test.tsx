import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageTransition } from './PageTransition'

describe('PageTransition Component', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <PageTransition>
        <div>First</div>
        <div>Second</div>
      </PageTransition>
    )

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('accepts delay prop', () => {
    const { container } = render(
      <PageTransition delay={0.5}>
        <div>Test Content</div>
      </PageTransition>
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with default delay', () => {
    const { container } = render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    )

    expect(container.firstChild).toBeInTheDocument()
  })
})
