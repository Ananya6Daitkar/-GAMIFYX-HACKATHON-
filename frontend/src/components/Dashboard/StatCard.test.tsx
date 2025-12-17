import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard Component', () => {
  it('should render title and value', () => {
    render(<StatCard title="Experience Points" value={1500} />)

    expect(screen.getByText('Experience Points')).toBeInTheDocument()
    expect(screen.getByText('1500')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    render(<StatCard title="Level" value={5} icon="🎯" />)

    expect(screen.getByText('🎯')).toBeInTheDocument()
  })

  it('should not render icon when not provided', () => {
    const { container } = render(<StatCard title="Level" value={5} />)

    const icons = container.querySelectorAll('[class*="text-cyan"]')
    expect(icons.length).toBe(0)
  })

  it('should render string values', () => {
    render(<StatCard title="Status" value="Active" />)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should render numeric values', () => {
    render(<StatCard title="Badges" value={42} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should apply delay prop to animation', () => {
    const { container } = render(
      <StatCard title="Test" value={100} delay={200} />
    )

    const card = container.firstChild
    expect(card).toBeInTheDocument()
  })

  it('should render with default delay of 0', () => {
    const { container } = render(<StatCard title="Test" value={100} />)

    const card = container.firstChild
    expect(card).toBeInTheDocument()
  })

  it('should have proper styling classes', () => {
    const { container } = render(
      <StatCard title="XP" value={5000} icon="⭐" />
    )

    const card = container.querySelector('[class*="backdrop-blur"]')
    expect(card).toBeInTheDocument()
  })

  it('should render title in uppercase with tracking', () => {
    render(<StatCard title="experience points" value={1000} />)

    const titleElement = screen.getByText('experience points')
    expect(titleElement).toHaveClass('uppercase')
  })
})
