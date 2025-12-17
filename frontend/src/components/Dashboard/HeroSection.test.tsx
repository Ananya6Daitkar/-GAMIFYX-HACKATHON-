import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './HeroSection'

describe('HeroSection Component', () => {
  it('should render welcome message with username', () => {
    render(<HeroSection username="johndoe" level={5} />)

    expect(screen.getByText(/Welcome, johndoe/i)).toBeInTheDocument()
  })

  it('should render level information', () => {
    render(<HeroSection username="testuser" level={10} />)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText(/Level/i)).toBeInTheDocument()
  })

  it('should render avatar image when provided', () => {
    const avatarUrl = 'https://example.com/avatar.jpg'
    render(
      <HeroSection username="testuser" level={5} avatar={avatarUrl} />
    )

    const img = screen.getByAltText('testuser')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', avatarUrl)
  })

  it('should render default avatar placeholder when no avatar provided', () => {
    render(<HeroSection username="testuser" level={5} />)

    expect(screen.getByText('👤')).toBeInTheDocument()
  })

  it('should render level indicator bar', () => {
    const { container } = render(
      <HeroSection username="testuser" level={5} />
    )

    const progressBar = container.querySelector('[class*="bg-gradient-to-r"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('should have proper styling with glass morphism', () => {
    const { container } = render(
      <HeroSection username="testuser" level={5} />
    )

    const heroCard = container.querySelector('[class*="backdrop-blur"]')
    expect(heroCard).toBeInTheDocument()
  })

  it('should render with neon glow effects', () => {
    const { container } = render(
      <HeroSection username="testuser" level={5} />
    )

    const glowEffect = container.querySelector('[class*="shadow-cyan"]')
    expect(glowEffect).toBeInTheDocument()
  })

  it('should render different usernames correctly', () => {
    const { rerender } = render(
      <HeroSection username="alice" level={3} />
    )

    expect(screen.getByText(/Welcome, alice/i)).toBeInTheDocument()

    rerender(<HeroSection username="bob" level={7} />)

    expect(screen.getByText(/Welcome, bob/i)).toBeInTheDocument()
  })

  it('should render different levels correctly', () => {
    const { rerender } = render(
      <HeroSection username="testuser" level={1} />
    )

    expect(screen.getByText('1')).toBeInTheDocument()

    rerender(<HeroSection username="testuser" level={50} />)

    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('should have orbitron font for headings', () => {
    render(<HeroSection username="testuser" level={5} />)

    const heading = screen.getByText(/Welcome, testuser/i)
    expect(heading).toHaveClass('font-orbitron')
  })
})
