import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Test component that uses the theme hook
const TestComponent = () => {
  const { mode, toggleTheme } = useTheme()
  return (
    <div>
      <p data-testid="theme-mode">{mode}</p>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark', 'light')
  })

  it('should provide default dark theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const modeElement = screen.getByTestId('theme-mode')
    expect(modeElement.textContent).toBe('dark')
  })

  it('should toggle theme when toggleTheme is called', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')
    const modeElement = screen.getByTestId('theme-mode')

    expect(modeElement.textContent).toBe('dark')

    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(modeElement.textContent).toBe('light')
    })
  })

  it('should persist theme to localStorage', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')

    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(localStorage.getItem('gamifyx-theme')).toBe('light')
    })
  })

  it('should load theme from localStorage on mount', () => {
    localStorage.setItem('gamifyx-theme', 'light')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const modeElement = screen.getByTestId('theme-mode')
    expect(modeElement.textContent).toBe('light')
  })

  it('should apply dark class to html element', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('should apply light class to html element when toggled', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')

    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTheme must be used within ThemeProvider')

    consoleError.mockRestore()
  })
})
