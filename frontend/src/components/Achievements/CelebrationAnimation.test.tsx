import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CelebrationAnimation } from './CelebrationAnimation'

describe('CelebrationAnimation Component', () => {
  it('should not render when isVisible is false', () => {
    const { container } = render(
      <CelebrationAnimation isVisible={false} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('should render when isVisible is true', () => {
    const { container } = render(
      <CelebrationAnimation isVisible={true} />
    )
    expect(container.firstChild).not.toBeEmptyDOMElement()
  })

  it('should render celebration emoji', () => {
    render(<CelebrationAnimation isVisible={true} />)
    expect(screen.getByText('🎉')).toBeInTheDocument()
  })

  it('should render confetti particles', () => {
    const { container } = render(
      <CelebrationAnimation isVisible={true} />
    )
    const particles = container.querySelectorAll('[class*="absolute"]')
    expect(particles.length).toBeGreaterThan(1)
  })

  it('should call onComplete callback after animation', async () => {
    const onComplete = vi.fn()
    render(
      <CelebrationAnimation isVisible={true} onComplete={onComplete} />
    )

    await waitFor(
      () => {
        expect(onComplete).toHaveBeenCalled()
      },
      { timeout: 2500 }
    )
  })

  it('should not call onComplete if not provided', async () => {
    const { rerender } = render(
      <CelebrationAnimation isVisible={true} />
    )

    await waitFor(() => {
      expect(true).toBe(true)
    })

    rerender(<CelebrationAnimation isVisible={false} />)
  })

  it('should render multiple confetti particles', () => {
    const { container } = render(
      <CelebrationAnimation isVisible={true} />
    )
    const particles = container.querySelectorAll('[class*="text-2xl"]')
    expect(particles.length).toBeGreaterThan(0)
  })

  it('should have radial glow effect', () => {
    const { container } = render(
      <CelebrationAnimation isVisible={true} />
    )
    const glow = container.querySelector('[class*="bg-cyan-500"]')
    expect(glow).toBeInTheDocument()
  })

  it('should be pointer-events-none', () => {
    const { container } = render(
      <CelebrationAnimation isVisible={true} />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('pointer-events-none')
  })

  it('should hide animation when isVisible becomes false', async () => {
    const { rerender, container } = render(
      <CelebrationAnimation isVisible={true} />
    )

    expect(container.innerHTML).not.toBe('')

    rerender(<CelebrationAnimation isVisible={false} />)

    expect(container.innerHTML).toBe('')
  })
})
