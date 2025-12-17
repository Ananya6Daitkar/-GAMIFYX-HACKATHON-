import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressChart } from './ProgressChart'
import { ProgressData } from './Analytics'

describe('ProgressChart Component', () => {
  it('should render chart title and description', () => {
    const data: ProgressData[] = []
    render(<ProgressChart data={data} />)

    expect(screen.getByText('Progress Over Time')).toBeInTheDocument()
    expect(screen.getByText('XP growth and level progression')).toBeInTheDocument()
  })

  it('should display no data message when data is empty', () => {
    const data: ProgressData[] = []
    render(<ProgressChart data={data} />)

    expect(screen.getByText('No progress data available')).toBeInTheDocument()
  })

  it('should render chart when data is provided', () => {
    const data: ProgressData[] = [
      { date: '2024-01-01', totalXP: 100, level: 1 },
      { date: '2024-01-02', totalXP: 250, level: 1 },
    ]
    render(<ProgressChart data={data} />)

    expect(screen.getByText('Progress Over Time')).toBeInTheDocument()
    expect(screen.getByText('XP growth and level progression')).toBeInTheDocument()
  })

  it('should handle single progress data point', () => {
    const data: ProgressData[] = [{ date: '2024-01-01', totalXP: 100, level: 1 }]
    render(<ProgressChart data={data} />)

    expect(screen.getByText('Progress Over Time')).toBeInTheDocument()
    expect(screen.getByText('XP growth and level progression')).toBeInTheDocument()
  })
})
