import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityChart } from './ActivityChart'
import { ActivityData } from './Analytics'

describe('ActivityChart Component', () => {
  it('should render chart title and description', () => {
    const data: ActivityData[] = []
    render(<ActivityChart data={data} />)

    expect(screen.getByText('Activity Timeline')).toBeInTheDocument()
    expect(screen.getByText('Submissions per day (30-day history)')).toBeInTheDocument()
  })

  it('should display no data message when data is empty', () => {
    const data: ActivityData[] = []
    render(<ActivityChart data={data} />)

    expect(screen.getByText('No activity data available')).toBeInTheDocument()
  })

  it('should render chart when data is provided', () => {
    const data: ActivityData[] = [
      { date: '2024-01-01', submissionCount: 2, xpEarned: 100 },
      { date: '2024-01-02', submissionCount: 3, xpEarned: 150 },
    ]
    render(<ActivityChart data={data} />)

    expect(screen.getByText('Activity Timeline')).toBeInTheDocument()
    expect(screen.getByText('Submissions per day (30-day history)')).toBeInTheDocument()
  })

  it('should handle single data point', () => {
    const data: ActivityData[] = [{ date: '2024-01-01', submissionCount: 1, xpEarned: 50 }]
    render(<ActivityChart data={data} />)

    expect(screen.getByText('Activity Timeline')).toBeInTheDocument()
    expect(screen.getByText('Submissions per day (30-day history)')).toBeInTheDocument()
  })
})
