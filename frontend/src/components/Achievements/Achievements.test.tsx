import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Achievements } from './Achievements'
import * as apiModule from '../../utils/api'

vi.mock('../../utils/api')

const mockBadges = [
  {
    id: '1',
    name: 'First Submission',
    description: 'Submit your first code',
    criteria: 'Submit 1 code',
    icon: '🚀',
    createdAt: new Date(),
  },
]

describe('Achievements Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiModule.api.get).mockImplementation((url) => {
      if (url === '/badges') return Promise.resolve(mockBadges)
      if (url === '/badges/earned') return Promise.resolve([])
      return Promise.resolve([])
    })
  })

  it('should render achievements container', async () => {
    const { container } = render(<Achievements />)

    await waitFor(() => {
      const achievementsDiv = container.querySelector('[class*="container"]')
      expect(achievementsDiv).toBeInTheDocument()
    })
  })

  it('should render BadgeGrid component', async () => {
    render(<Achievements />)

    await waitFor(() => {
      expect(
        screen.getByText('Achievements & Badges')
      ).toBeInTheDocument()
    })
  })

  it('should pass userId prop to BadgeGrid', async () => {
    render(<Achievements userId="user123" />)

    await waitFor(() => {
      expect(apiModule.api.get).toHaveBeenCalledWith('/users/user123/badges')
    })
  })

  it('should have glass morphism styling', () => {
    const { container } = render(<Achievements />)

    const glassDiv = container.querySelector('[class*="backdrop-blur"]')
    expect(glassDiv).toBeInTheDocument()
  })

  it('should have gradient background', () => {
    const { container } = render(<Achievements />)

    const gradientDiv = container.querySelector('[class*="from-slate"]')
    expect(gradientDiv).toBeInTheDocument()
  })

  it('should have cyan border', () => {
    const { container } = render(<Achievements />)

    const borderDiv = container.querySelector('[class*="border-cyan"]')
    expect(borderDiv).toBeInTheDocument()
  })

  it('should render with proper padding', () => {
    const { container } = render(<Achievements />)

    const paddedDiv = container.querySelector('[class*="p-8"]')
    expect(paddedDiv).toBeInTheDocument()
  })
})
