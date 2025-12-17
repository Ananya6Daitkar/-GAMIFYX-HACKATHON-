import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkipLink } from './SkipLink'

describe('SkipLink Component', () => {
  beforeEach(() => {
    // Create main content element for testing
    const main = document.createElement('main')
    main.id = 'main-content'
    main.tabIndex = -1
    document.body.appendChild(main)
  })

  afterEach(() => {
    const main = document.querySelector('main')
    if (main) {
      document.body.removeChild(main)
    }
  })

  it('should render skip link', () => {
    render(<SkipLink />)
    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
  })

  it('should have sr-only class by default', () => {
    render(<SkipLink />)
    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toHaveClass('sr-only')
  })

  it('should focus main content when clicked', () => {
    render(<SkipLink />)
    const skipLink = screen.getByText('Skip to main content')
    const main = document.querySelector('main')

    fireEvent.click(skipLink)

    expect(document.activeElement).toBe(main)
  })

  it('should have href attribute', () => {
    render(<SkipLink />)
    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })
})
