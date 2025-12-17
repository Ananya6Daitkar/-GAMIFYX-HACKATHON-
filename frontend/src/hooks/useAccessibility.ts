import { useEffect, useRef, useCallback } from 'react'

interface UseAccessibilityOptions {
  onEscape?: () => void
  onEnter?: () => void
  trapFocus?: boolean
}

/**
 * Hook for managing accessibility features including keyboard navigation and focus management
 * Validates: Requirements 14.2, 14.3, 14.4
 */
export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const { onEscape, onEnter, trapFocus = false } = options
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
      }

      if (e.key === 'Enter' && onEnter) {
        e.preventDefault()
        onEnter()
      }

      // Focus trap for modals
      if (trapFocus && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, onEnter, trapFocus])

  // Auto-focus first focusable element when trapFocus is enabled
  useEffect(() => {
    if (trapFocus && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      firstElement?.focus()
    }
  }, [trapFocus])

  return { containerRef }
}

/**
 * Hook for announcing screen reader messages
 * Validates: Requirements 14.3
 */
export const useAnnouncement = () => {
  const announcementRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) {
      const div = document.createElement('div')
      div.setAttribute('role', 'status')
      div.setAttribute('aria-live', priority)
      div.setAttribute('aria-atomic', 'true')
      div.className = 'sr-only'
      document.body.appendChild(div)
      announcementRef.current = div
    }

    announcementRef.current.setAttribute('aria-live', priority)
    announcementRef.current.textContent = message
  }, [])

  return { announce, announcementRef }
}

/**
 * Hook for managing skip links
 * Validates: Requirements 14.2
 */
export const useSkipLink = () => {
  const skipToMainContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
    if (mainContent) {
      ;(mainContent as HTMLElement).focus()
      if (typeof (mainContent as HTMLElement).scrollIntoView === 'function') {
        ;(mainContent as HTMLElement).scrollIntoView()
      }
    }
  }, [])

  return { skipToMainContent }
}
