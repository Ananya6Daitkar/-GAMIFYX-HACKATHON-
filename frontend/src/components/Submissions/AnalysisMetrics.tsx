import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, Eye, CheckCircle } from 'lucide-react'

interface MetricsData {
  codeQuality: number
  performance: number
  readability: number
  bestPractices: number
}

interface AnalysisMetricsProps {
  metrics: MetricsData
  isLoading?: boolean
}

const MetricCard: React.FC<{
  label: string
  value: number
  icon: React.ReactNode
  color: string
  delay: number
}> = ({ label, value, icon, color, delay }) => {
  const getStatusColor = (score: number) => {
    if (score >= 85) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getBackgroundColor = (score: number) => {
    if (score >= 85) return 'from-green-500/10 to-green-500/5'
    if (score >= 70) return 'from-yellow-500/10 to-yellow-500/5'
    return 'from-red-500/10 to-red-500/5'
  }

  const getBorderColor = (score: number) => {
    if (score >= 85) return 'border-green-500/30'
    if (score >= 70) return 'border-yellow-500/30'
    return 'border-red-500/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-gradient-to-br ${getBackgroundColor(value)} border ${getBorderColor(value)} rounded-lg p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`${color}`}>{icon}</div>
          <span className="text-sm font-semibold text-gray-300">{label}</span>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className={`text-3xl font-bold ${getStatusColor(value)}`}
        >
          {value}
        </motion.div>
        <span className="text-gray-400 text-sm mb-1">/100</span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </motion.div>
  )
}

export const AnalysisMetrics: React.FC<AnalysisMetricsProps> = ({
  metrics,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-slate-700 rounded mb-3 w-24" />
            <div className="h-8 bg-slate-700 rounded w-16 mb-3" />
            <div className="h-2 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white font-orbitron">Code Analysis</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Code Quality"
          value={metrics.codeQuality}
          icon={<CheckCircle className="w-5 h-5" />}
          color="text-cyan-400"
          delay={0}
        />
        <MetricCard
          label="Performance"
          value={metrics.performance}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-green-400"
          delay={0.1}
        />
        <MetricCard
          label="Readability"
          value={metrics.readability}
          icon={<Eye className="w-5 h-5" />}
          color="text-magenta-400"
          delay={0.2}
        />
        <MetricCard
          label="Best Practices"
          value={metrics.bestPractices}
          icon={<Zap className="w-5 h-5" />}
          color="text-yellow-400"
          delay={0.3}
        />
      </div>

      {/* Overall score */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-cyan-500/30 rounded-lg p-4 mt-6"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Overall Score</span>
          <div className="text-right">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-3xl font-bold text-cyan-400"
            >
              {Math.round(
                (metrics.codeQuality +
                  metrics.performance +
                  metrics.readability +
                  metrics.bestPractices) /
                  4
              )}
            </motion.div>
            <p className="text-xs text-gray-400">/100</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
