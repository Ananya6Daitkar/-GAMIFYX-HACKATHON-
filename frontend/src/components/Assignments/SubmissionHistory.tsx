import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AssignmentSubmission, AIFeedback } from '../../types'
import { SubmissionDetailCard } from './SubmissionDetailCard'

interface SubmissionHistoryProps {
  submissions: AssignmentSubmission[]
  feedbackMap?: Record<string, AIFeedback>
  onViewDetails?: (submission: AssignmentSubmission) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PASS':
      return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: '✓' }
    case 'REVIEW':
      return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: '⏳' }
    case 'FAIL':
      return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: '✕' }
    case 'IN_PROGRESS':
      return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: '⟳' }
    default:
      return { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', icon: '?' }
  }
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCommitSha = (sha: string) => {
  return sha.substring(0, 7)
}

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  submissions,
  feedbackMap = {},
  onViewDetails,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Submissions Yet</h3>
        <p className="text-gray-400">Your submissions will appear here once you push code to your repository.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission, idx) => {
        const statusInfo = getStatusColor(submission.status)
        const isExpanded = expandedId === submission.id
        const feedback = feedbackMap[submission.id]

        return (
          <motion.div
            key={submission.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative group"
          >
            {/* Neon glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
              {/* Header - always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                className="w-full text-left p-4 hover:bg-slate-700/30 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Status indicator */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${statusInfo.bg} border ${statusInfo.border}`}
                    >
                      <span className={`text-lg font-bold ${statusInfo.text}`}>
                        {statusInfo.icon}
                      </span>
                    </div>

                    {/* Submission info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-mono text-sm">
                          {formatCommitSha(submission.id)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${statusInfo.bg} ${statusInfo.border} border ${statusInfo.text}`}
                        >
                          {submission.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-purple-500/20 border border-purple-500/50 text-purple-400">
                          Score: {submission.score}%
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-cyan-400 text-xl"
                  >
                    ▼
                  </motion.div>
                </div>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-cyan-500/20"
                  >
                    <div className="p-4">
                      <SubmissionDetailCard
                        submission={submission}
                        feedback={feedback}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
