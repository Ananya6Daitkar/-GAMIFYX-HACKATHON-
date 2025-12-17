/**
 * Performance monitoring utilities for tracking load times and metrics
 */

interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  cumulativeLayoutShift?: number
  timeToInteractive?: number
}

/**
 * Measure page load time and report metrics
 */
export const measurePageLoad = (): PerformanceMetrics => {
  const metrics: PerformanceMetrics = {
    pageLoadTime: 0,
  }

  // Get navigation timing
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing
    metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart
  }

  // Get Web Vitals if available
  if ('PerformanceObserver' in window) {
    try {
      // Measure First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcp) {
        metrics.firstContentfulPaint = fcp.startTime
      }

      // Measure Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        metrics.largestContentfulPaint = lastEntry.startTime
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      // Measure Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            metrics.cumulativeLayoutShift = clsValue
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('Performance monitoring not fully supported:', e)
    }
  }

  return metrics
}

/**
 * Report performance metrics to console and optionally to analytics
 */
export const reportPerformanceMetrics = (metrics: PerformanceMetrics): void => {
  console.log('Performance Metrics:', {
    pageLoadTime: `${metrics.pageLoadTime}ms`,
    firstContentfulPaint: metrics.firstContentfulPaint ? `${metrics.firstContentfulPaint.toFixed(2)}ms` : 'N/A',
    largestContentfulPaint: metrics.largestContentfulPaint ? `${metrics.largestContentfulPaint.toFixed(2)}ms` : 'N/A',
    cumulativeLayoutShift: metrics.cumulativeLayoutShift ? metrics.cumulativeLayoutShift.toFixed(3) : 'N/A',
  })

  // Check if page load time meets target (2 seconds)
  if (metrics.pageLoadTime > 2000) {
    console.warn(`⚠️ Page load time (${metrics.pageLoadTime}ms) exceeds 2-second target`)
  } else {
    console.log(`✓ Page load time (${metrics.pageLoadTime}ms) meets 2-second target`)
  }
}

/**
 * Measure component render time
 */
export const measureComponentRender = (componentName: string, callback: () => void): void => {
  const startTime = performance.now()
  callback()
  const endTime = performance.now()
  const renderTime = endTime - startTime

  if (renderTime > 100) {
    console.warn(`⚠️ ${componentName} render time (${renderTime.toFixed(2)}ms) is slow`)
  }
}

/**
 * Get resource timing information
 */
export const getResourceTimings = (): PerformanceResourceTiming[] => {
  if (!window.performance || !window.performance.getEntriesByType) {
    return []
  }

  return performance.getEntriesByType('resource') as PerformanceResourceTiming[]
}

/**
 * Report bundle size and resource timings
 */
export const reportResourceMetrics = (): void => {
  const resources = getResourceTimings()
  
  // Group by type
  const byType: Record<string, number> = {}
  resources.forEach(resource => {
    const type = resource.initiatorType || 'other'
    byType[type] = (byType[type] || 0) + (resource.transferSize || 0)
  })

  console.log('Resource Metrics (bytes transferred):', byType)

  // Warn about large resources
  resources.forEach(resource => {
    if ((resource.transferSize || 0) > 500000) {
      console.warn(`⚠️ Large resource: ${resource.name} (${((resource.transferSize || 0) / 1024).toFixed(2)}KB)`)
    }
  })
}
