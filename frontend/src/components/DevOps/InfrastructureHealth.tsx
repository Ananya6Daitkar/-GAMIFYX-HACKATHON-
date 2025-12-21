import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Server, Database, Zap, Activity } from 'lucide-react'

interface HealthMetric {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  value: number
  unit: string
  icon: React.ReactNode
}

export const InfrastructureHealth: React.FC = () => {
  const [metrics] = useState<HealthMetric[]>([
    {
      name: 'API Server',
      status: 'healthy',
      value: 99.8,
      unit: '%',
      icon: <Server className="w-5 h-5" />,
    },
    {
      name: 'Database',
      status: 'healthy',
      value: 98.5,
      unit: '%',
      icon: <Database className="w-5 h-5" />,
    },
    {
      name: 'CPU Usage',
      status: 'warning',
      value: 72,
      unit: '%',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      name: 'Memory Usage',
      status: 'healthy',
      value: 45,
      unit: '%',
      icon: <Activity className="w-5 h-5" />,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'from-green-500/10 to-green-500/5 border-green-500/30'
      case 'warning':
        return 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/30'
      case 'critical':
        return 'from-red-500/10 to-red-500/5 border-red-500/30'
      default:
        return 'from-gray-500/10 to-gray-500/5 border-gray-500/30'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'critical':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getIconColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'critical':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Server className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white font-orbitron">Infrastructure Health</h3>
        <span className="ml-auto text-sm text-gray-400">Real-time monitoring</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`bg-gradient-to-r ${getStatusColor(metric.status)} border rounded-lg p-4`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={getIconColor(metric.status)}>{metric.icon}</div>
                <h4 className="font-semibold text-white">{metric.name}</h4>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(metric.status)}`}>
                {metric.status.toUpperCase()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">
                  {metric.value}
                  {metric.unit}
                </span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${
                    metric.status === 'healthy'
                      ? 'bg-green-500'
                      : metric.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Status Message */}
            <p className="text-xs text-gray-400">
              {metric.status === 'healthy' && '✓ All systems operational'}
              {metric.status === 'warning' && '⚠ Monitor closely'}
              {metric.status === 'critical' && '✕ Immediate action required'}
            </p>
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
          <span className="font-semibold">📊 Infrastructure Monitoring:</span> Real-time monitoring of all infrastructure components. Automatic alerts when thresholds are exceeded. Teachers can see system health and performance metrics.
        </p>
      </motion.div>
    </div>
  )
}
