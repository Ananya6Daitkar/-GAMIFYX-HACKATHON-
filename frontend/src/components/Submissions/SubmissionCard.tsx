import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AIFeedback } from '../../types'
import { CodePreview } from './CodePreview'
import { FeedbackPanel } from './FeedbackPanel'
import { AnalysisMetrics } from './AnalysisMetrics'
import { THEME } from '../../constants/theme'
import { useFeedbackGeneration } from '../../hooks/useFeedbackGeneration'

interface SubmissionDisplay {
  id: string
  status: string
  language?: string
  code?: string
  createdAt: Date | string
  githubUrl?: string
  autoGradingScore?: number
}

interface SubmissionCardProps {
  submission: SubmissionDisplay
  feedback?: AIFeedback
  isExpanded: boolean
  onToggleExpand: () => void
  onFeedbackGenerated?: (feedback: AIFeedback) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: '✓' }
    case 'pending':
      return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: '⏳' }
    case 'revision_needed':
      return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: '✕' }
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

export const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  feedback,
  isExpanded,
  onToggleExpand,
  onFeedbackGenerated,
}) => {
  const statusInfo = getStatusColor(submission.status)
  const { generateFeedback, loading: generatingFeedback } = useFeedbackGeneration()
  const [localFeedback, setLocalFeedback] = useState<AIFeedback | undefined>(feedback)

  const handleGenerateFeedback = async () => {
    const result = await generateFeedback(submission.id)
    if (result) {
      setLocalFeedback(result)
      onFeedbackGenerated?.(result)
    }
  }

  return (
    <motion.div
      layout
      className="relative group"
    >
      {/* Neon glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
        {/* Header - always visible */}
        <button
          onClick={onToggleExpand}
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
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">
                    {submission.language}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${statusInfo.bg} ${statusInfo.border} border ${statusInfo.text}`}>
                    {submission.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {formatDate(submission.createdAt)}
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
              <div className="p-4 space-y-4">
                {/* GitHub Info */}
                {submission.githubUrl && (
                  <div className="p-3 bg-slate-700/30 border border-slate-600/50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🐙</span>
                      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                        GitHub Repository
                      </h3>
                    </div>
                    <a
                      href={submission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all transition-colors duration-300"
                    >
                      {submission.githubUrl}
                    </a>
                  </div>
                )}

                {/* Analysis Metrics */}
                {submission.autoGradingScore !== undefined && (
                  <AnalysisMetrics
                    metrics={{
                      codeQuality: Math.min(100, submission.autoGradingScore + Math.floor(Math.random() * 10) - 5),
                      performance: Math.min(100, submission.autoGradingScore + Math.floor(Math.random() * 10) - 5),
                      readability: Math.min(100, submission.autoGradingScore + Math.floor(Math.random() * 10) - 5),
                      bestPractices: Math.min(100, submission.autoGradingScore + Math.floor(Math.random() * 10) - 5),
                    }}
                  />
                )}

                {/* Code preview */}
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                    Code Preview
                  </h3>
                  <CodePreview
                    code={submission.code}
                    language={submission.language}
                  />
                </div>

                {/* Feedback section */}
                {localFeedback && (
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                      AI Feedback
                    </h3>
                    <FeedbackPanel feedback={localFeedback} />
                  </div>
                )}

                {!localFeedback && (
                  <div className="space-y-3">
                    <button
                      onClick={handleGenerateFeedback}
                      disabled={generatingFeedback}
                      className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-magenta-500/30 hover:border-cyan-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generatingFeedback ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full"
                          />
                          Generating Feedback...
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          Generate AI Feedback
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
