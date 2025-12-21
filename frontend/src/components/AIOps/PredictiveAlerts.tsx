import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, TrendingDown, Clock, Zap } from 'lucide-react'

interface StudentAlert {
  id: string
  studentName: string
  riskLevel: 'high' | 'medium' | 'low'
  reason: string
  metric: string
  action: string
  timestamp: Date
}

export const PredictiveAlerts: React.FC = () => {
  const [alerts] = useState<StudentAlert[]>([
    {
      id: '1',
      studentName: 'Alex Johnson',
      riskLevel: 'high',
      reason: 'No submission in 5 days',
      metric: 'Submission Gap',
      action: 'Send reminder & offer help',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      studentName: 'Sarah Chen',
      riskLevel: 'high',
      reason: 'Code quality declining (92→65)',
      metric: 'Quality Drop',
      action: 'Suggest code review session',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '3',
      studentName: 'Mike Davis',
      riskLevel: 'medium',
      reason: 'Struggling with recursion (3 failed attempts)',
      metric: 'Concept Mastery',
      action: 'Recommend tutorial & practice problems',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: '4',
      studentName: 'Emma Wilson',
      riskLevel: 'medium',
      reason: 'Below average performance (72/100)',
      metric: 'Performance Score',
      action: 'Offer 1-on-1 mentoring',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'from-red-500/10 to-red-500/5 border-red-500/30'
      case 'medium':
        return 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/30'
      case 'low':
        return 'from-green-500/10 to-green-500/5 border-green-500/30'
      default:
        return 'from-gray-500/10 to-gray-500/5 border-gray-500/30'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'medium':
        return <TrendingDown className="w-5 h-5 text-yellow-400" />
      case 'low':
        return <Zap className="w-5 h-5 text-green-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-bold text-white font-orbitron">Predictive Alerts (AIOps)</h3>
        <span className="ml-auto text-sm text-gray-400">{alerts.length} alerts</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`bg-gradient-to-r ${getRiskColor(alert.riskLevel)} border rounded-lg p-4`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="mt-1">{getRiskIcon(alert.riskLevel)}</div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{alert.studentName}</h4>
                  <span className="text-xs text-gray-400">{formatTime(alert.timestamp)}</span>
                </div>

                <p className="text-sm text-gray-300 mb-2">{alert.reason}</p>

                <div className="flex items-center gap-4 text-xs">
                  <span className="px-2 py-1 bg-slate-700/50 rounded text-gray-300">
                    {alert.metric}
                  </span>
                  <span className="text-cyan-400">→ {alert.action}</span>
                </div>
              </div>

              {/* Risk Badge */}
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    alert.riskLevel === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : alert.riskLevel === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {alert.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mt-6"
      >
        <p className="text-sm text-cyan-300">
          <span className="font-semibold">🤖 AIOps in Action:</span> Our AI monitors all student activity in real-time and automatically detects at-risk students. Teachers get instant alerts so they can intervene before students fall behind.
        </p>
      </motion.div>
    </div>
  )
}
