import React from 'react'
import { useSkipLink } from '../../hooks/useAccessibility'

/**
 * SkipLink component for keyboard navigation
 * Allows users to skip to main content
 * Validates: Requirements 14.2
 */
export const SkipLink: React.FC = () => {
  const { skipToMainContent } = useSkipLink()

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault()
        skipToMainContent()
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-cyan-500 focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
    >
      Skip to main content
    </a>
  )
}
