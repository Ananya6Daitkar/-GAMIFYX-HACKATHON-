import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AIFeedback, AssignmentSubmission } from '../../types'
import { mockSubmissions, mockAIFeedback } from '../../utils/mockData'
import { SubmissionCard } from './SubmissionCard'
import { ANIMATION_DELAYS } from '../../constants/theme'

interface SubmissionListProps {
  studentId?: string
}

interface SubmissionDisplay {
  id: string
  status: string
  code?: string
  language?: string
  createdAt: Date | string
}

export const SubmissionList: React.FC<SubmissionListProps> = ({ studentId }) => {
  const [submissions] = useState<SubmissionDisplay[]>(
    mockSubmissions.map((sub, idx) => ({
      ...sub,
      createdAt: sub.submittedAt,
      language: 'JavaScript',
      code: 'const hello = "world";',
      githubUrl: `https://github.com/testuser/assignment-${idx + 1}`,
      autoGradingScore: 85 + Math.floor(Math.random() * 15),
    })) as SubmissionDisplay[]
  )
  const [feedbackMap] = useState<Record<string, AIFeedback>>({
    'sub1': mockAIFeedback,
  })
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 border-r-2 border-magenta-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
        <p className="font-medium">Error loading submissions</p>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No submissions yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Submit your first code to get started
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {submissions.map((submission, index) => (
        <motion.div
          key={submission.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: (index * ANIMATION_DELAYS.staggerCard) / 1000,
            duration: 0.3,
          }}
        >
          <SubmissionCard
            submission={submission}
            feedback={feedbackMap[submission.id]}
            isExpanded={expandedId === submission.id}
            onToggleExpand={() =>
              setExpandedId(expandedId === submission.id ? null : submission.id)
            }
            onFeedbackGenerated={() => {
              // Feedback generated - no-op for mock data
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
