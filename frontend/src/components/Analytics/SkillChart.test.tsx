import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkillChart } from './SkillChart'
import { SkillData } from './Analytics'

describe('SkillChart Component', () => {
  it('should render chart title and description', () => {
    const data: SkillData[] = []
    render(<SkillChart data={data} />)

    expect(screen.getByText('Skill Distribution')).toBeInTheDocument()
    expect(screen.getByText('Proficiency by programming language')).toBeInTheDocument()
  })

  it('should display no data message when data is empty', () => {
    const data: SkillData[] = []
    render(<SkillChart data={data} />)

    expect(screen.getByText('No skill data available')).toBeInTheDocument()
  })

  it('should render chart when data is provided', () => {
    const data: SkillData[] = [
      { language: 'JavaScript', proficiency: 85 },
      { language: 'Python', proficiency: 70 },
    ]
    render(<SkillChart data={data} />)

    expect(screen.getByText('Skill Distribution')).toBeInTheDocument()
    expect(screen.getByText('Proficiency by programming language')).toBeInTheDocument()
  })

  it('should handle single skill data point', () => {
    const data: SkillData[] = [{ language: 'TypeScript', proficiency: 90 }]
    render(<SkillChart data={data} />)

    expect(screen.getByText('Skill Distribution')).toBeInTheDocument()
    expect(screen.getByText('Proficiency by programming language')).toBeInTheDocument()
  })
})
