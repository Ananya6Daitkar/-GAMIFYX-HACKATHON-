import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CodePreview } from './CodePreview'

describe('CodePreview Component', () => {
  it('should render language label', () => {
    render(<CodePreview code="const x = 5;" language="javascript" />)
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  it('should display line count', () => {
    const code = 'line 1\nline 2\nline 3'
    render(<CodePreview code={code} language="javascript" />)
    expect(screen.getByText('3 lines')).toBeInTheDocument()
  })

  it('should render line numbers', () => {
    const code = 'line 1\nline 2'
    render(<CodePreview code={code} language="javascript" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should display code content', () => {
    const code = 'const x = 5;'
    render(<CodePreview code={code} language="javascript" />)
    expect(screen.getByText(/const/)).toBeInTheDocument()
  })

  it('should show truncation notice for long code', () => {
    const lines = Array(25).fill('const x = 5;').join('\n')
    render(<CodePreview code={lines} language="javascript" />)
    expect(screen.getByText(/and 5 more lines/)).toBeInTheDocument()
  })

  it('should handle different languages', () => {
    render(<CodePreview code="print('hello')" language="python" />)
    expect(screen.getByText('python')).toBeInTheDocument()
  })

  it('should handle empty code', () => {
    render(<CodePreview code="" language="javascript" />)
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })
})
