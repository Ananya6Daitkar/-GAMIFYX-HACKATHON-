import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { measurePageLoad, reportPerformanceMetrics, reportResourceMetrics } from './utils/performance'

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = measurePageLoad()
      reportPerformanceMetrics(metrics)
      reportResourceMetrics()
    }, 0)
  })
}

console.log('GamifyX: Mounting React app...')
const root = document.getElementById('root')
console.log('GamifyX: Root element found:', !!root)

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('GamifyX: React app mounted successfully')
} else {
  console.error('GamifyX: Root element not found!')
}
