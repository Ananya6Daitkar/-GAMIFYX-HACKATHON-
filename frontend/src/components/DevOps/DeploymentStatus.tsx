import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'

interface Deployment {
  id: string
  studentName: string
  branch: string
  status: 'success' | 'failed' | 'pending'
  timestamp: Date
  buildTime: number
  testsPassed: number
  testsTotal: number
}

export const DeploymentStatus: React.FC = () => {
  const [deployments] = useState<Deployment[]>([
    {
      id: '1',
      studentName: 'Alex Johnson',
      branch: 'feature/auth-system',
      status: 'success',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      buildTime: 45,
      testsPassed: 24,
      testsTotal: 24,
    },
    {
      id: '2',
      studentName: 'Sarah Chen',
      branch: 'feature/api-optimization',
      status: 'success',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      buildTime: 38,
      testsPassed: 19,
      testsTotal: 19,
    },
    {
      id: '3',
      studentName: 'Mike Davis',
      branch: 'bugfix/database-query',
      status: 'failed',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      buildTime: 52,
      testsPassed: 18,
      testsTotal: 20,
    },
    {
      id: '4',
      studentName: 'Emma Wilson',
      branch: 'feature/ui-redesign',
      status: 'pending',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      buildTime: 0,
      testsPassed: 0,
      testsTotal: 15,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'from-green-500/10 to-green-500/5 border-green-500/30'
      case 'failed':
        return 'from-red-500/10 to-red-500/5 border-red-500/30'
      case 'pending':
        return 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/30'
      default:
        return 'from-gray-500/10 to-gray-500/5 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <Zap className="w-5 h-5 text-gray-400" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white font-orbitron">CI/CD Pipeline Status</h3>
        <span className="ml-auto text-sm text-gray-400">{deployments.length} deployments</span>
      </div>

      <div className="space-y-3">
        {deployments.map((deployment, idx) => (
          <motion.div
            key={deployment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`bg-gradient-to-r ${getStatusColor(deployment.status)} border rounded-lg p-4`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="mt-1">
                {deployment.status === 'pending' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getStatusIcon(deployment.status)}
                  </motion.div>
                ) : (
                  getStatusIcon(deployment.status)
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{deployment.studentName}</h4>
                  <span className="text-xs text-gray-400">{formatTime(deployment.timestamp)}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-slate-700/50 rounded text-gray-300">
                    {deployment.branch}
                  </span>
                  {deployment.status === 'success' && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 rounded text-green-400">
                      ✓ All tests passed
                    </span>
                  )}
                  {deployment.status === 'failed' && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 rounded text-red-400">
                      ✕ {deployment.testsTotal - deployment.testsPassed} test(s) failed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-300">
                  <span>Build: {deployment.buildTime}s</span>
                  <span>Tests: {deployment.testsPassed}/{deployment.testsTotal}</span>
                  {deployment.status === 'success' && (
                    <span className="text-green-400 font-semibold">→ Deployed to production</span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    deployment.status === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : deployment.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {deployment.status.toUpperCase()}
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
          <span className="font-semibold">🚀 DevOps in Action:</span> Every student push triggers automated CI/CD pipeline. Code is built, tested, and deployed automatically. Teachers see real-time deployment status and can identify build failures instantly.
        </p>
      </motion.div>
    </div>
  )
}
