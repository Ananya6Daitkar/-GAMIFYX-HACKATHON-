import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAccessibility, useAnnouncement, useSkipLink } from './useAccessibility'

describe('useAccessibility Hook', () => {
  it('should handle Escape key', () => {
    const onEscape = vi.fn()
    renderHook(() => useAccessibility({ onEscape }))

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    act(() => {
      window.dispatchEvent(event)
    })

    expect(onEscape).toHaveBeenCalled()
  })

  it('should handle Enter key', () => {
    const onEnter = vi.fn()
    renderHook(() => useAccessibility({ onEnter }))

    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    act(() => {
      window.dispatchEvent(event)
    })

    expect(onEnter).toHaveBeenCalled()
  })

  it('should not call handlers for other keys', () => {
    const onEscape = vi.fn()
    const onEnter = vi.fn()
    renderHook(() => useAccessibility({ onEscape, onEnter }))

    const event = new KeyboardEvent('keydown', { key: 'a' })
    act(() => {
      window.dispatchEvent(event)
    })

    expect(onEscape).not.toHaveBeenCalled()
    expect(onEnter).not.toHaveBeenCalled()
  })
})

describe('useAnnouncement Hook', () => {
  afterEach(() => {
    const announcement = document.querySelector('[role="status"]')
    if (announcement) {
      document.body.removeChild(announcement)
    }
  })

  it('should create announcement element', () => {
    const { result } = renderHook(() => useAnnouncement())

    act(() => {
      result.current.announce('Test announcement')
    })

    const announcement = document.querySelector('[role="status"]')
    expect(announcement).toBeInTheDocument()
    expect(announcement?.textContent).toBe('Test announcement')
  })

  it('should set aria-live to polite by default', () => {
    const { result } = renderHook(() => useAnnouncement())

    act(() => {
      result.current.announce('Test announcement')
    })

    const announcement = document.querySelector('[role="status"]')
    expect(announcement).toHaveAttribute('aria-live', 'polite')
  })

  it('should set aria-live to assertive when specified', () => {
    const { result } = renderHook(() => useAnnouncement())

    act(() => {
      result.current.announce('Test announcement', 'assertive')
    })

    const announcement = document.querySelector('[role="status"]')
    expect(announcement).toHaveAttribute('aria-live', 'assertive')
  })

  it('should update announcement text on new announcement', () => {
    const { result } = renderHook(() => useAnnouncement())

    act(() => {
      result.current.announce('First announcement')
    })

    let announcement = document.querySelector('[role="status"]')
    expect(announcement?.textContent).toBe('First announcement')

    act(() => {
      result.current.announce('Second announcement')
    })

    announcement = document.querySelector('[role="status"]')
    expect(announcement?.textContent).toBe('Second announcement')
  })
})

describe('useSkipLink Hook', () => {
  afterEach(() => {
    const main = document.querySelector('main')
    if (main) {
      document.body.removeChild(main)
    }
  })

  it('should focus main content element', () => {
    const main = document.createElement('main')
    main.tabIndex = -1
    document.body.appendChild(main)

    const { result } = renderHook(() => useSkipLink())

    act(() => {
      result.current.skipToMainContent()
    })

    expect(document.activeElement).toBe(main)
  })

  it('should focus element with role="main"', () => {
    const mainDiv = document.createElement('div')
    mainDiv.setAttribute('role', 'main')
    mainDiv.tabIndex = -1
    document.body.appendChild(mainDiv)

    const { result } = renderHook(() => useSkipLink())

    act(() => {
      result.current.skipToMainContent()
    })

    expect(document.activeElement).toBe(mainDiv)
  })
})
