import { describe, it, expect, beforeEach, vi } from 'vitest'
import { measurePageLoad, reportPerformanceMetrics, getResourceTimings } from './performance'

describe('Performance Monitoring', () => {
  beforeEach(() => {
    // Mock performance API
    vi.stubGlobal('performance', {
      timing: {
        navigationStart: 0,
        loadEventEnd: 1500, // 1.5 seconds
      },
      getEntriesByType: vi.fn(() => []),
    })
  })

  it('should measure page load time', () => {
    const metrics = measurePageLoad()
    expect(metrics.pageLoadTime).toBe(1500)
  })

  it('should report metrics without errors', () => {
    const metrics = measurePageLoad()
    const consoleSpy = vi.spyOn(console, 'log')
    
    reportPerformanceMetrics(metrics)
    
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should warn when page load exceeds 2 seconds', () => {
    vi.stubGlobal('performance', {
      timing: {
        navigationStart: 0,
        loadEventEnd: 2500, // 2.5 seconds
      },
      getEntriesByType: vi.fn(() => []),
    })

    const metrics = measurePageLoad()
    const warnSpy = vi.spyOn(console, 'warn')
    
    reportPerformanceMetrics(metrics)
    
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('exceeds 2-second target')
    )
    warnSpy.mockRestore()
  })

  it('should return empty array when performance API is unavailable', () => {
    vi.stubGlobal('performance', undefined)
    const resources = getResourceTimings()
    expect(resources).toEqual([])
  })
})
