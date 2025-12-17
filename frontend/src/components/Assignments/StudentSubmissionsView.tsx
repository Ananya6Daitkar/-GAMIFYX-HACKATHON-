import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Assignment, AssignmentSubmission, User } from '../../types'
import { SubmissionHistory } from './SubmissionHistory'

interface StudentSubmissionsViewProps {
  assignment: Assignment
  submissions: AssignmentSubmission[]
  students: User[]
  onBack: () => void
  onReviewSubmission?: (submissionId: string, status: string, feedback?: string) => void
}

export const StudentSubmissionsView: React.FC<StudentSubmissionsViewProps> = ({
  assignment,
  submissions,
  students,
  onBack,
  onReviewSubmission,
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null)
  const [reviewFeedback, setReviewFeedback] = useState('')

  const studentMap = new Map(students.map((s) => [s.id, s]))

  const passCount = submissions.filter((s) => s.status === 'PASS').length
  const reviewCount = submissions.filter((s) => s.status === 'REVIEW').length
  const failCount = submissions.filter((s) => s.status === 'FAIL').length
  const inProgressCount = submissions.filter((s) => s.status === 'IN_PROGRESS').length

  const handleReviewSubmit = (status: string) => {
    if (selectedSubmission) {
      onReviewSubmission?.(selectedSubmission.id, status, reviewFeedback)
      setSelectedSubmission(null)
      setReviewFeedback('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-gray-300 font-medium hover:bg-slate-700/70 hover:border-slate-600/70 transition-all duration-300 flex items-center gap-2"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">{assignment.title}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            In Progress
          </div>
          <div className="text-2xl font-bold text-blue-400">{inProgressCount}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
        >
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Pass
          </div>
          <div className="text-2xl font-bold text-green-400">{passCount}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
        >
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Review
          </div>
          <div className="text-2xl font-bold text-yellow-400">{reviewCount}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Fail
          </div>
          <div className="text-2xl font-bold text-red-400">{failCount}</div>
        </motion.div>
      </div>

      {/* Submissions list */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Submissions</h3>
        <SubmissionHistory submissions={submissions} />
      </div>

      {/* Review panel */}
      {selectedSubmission && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Review Submission</h3>

          {/* Student info */}
          <div className="mb-4 p-3 bg-slate-700/30 border border-slate-600/50 rounded">
            <p className="text-sm text-gray-400">
              Student:{' '}
              <span className="text-white font-semibold">
                {studentMap.get(selectedSubmission.studentId)?.username || 'Unknown'}
              </span>
            </p>
          </div>

          {/* Feedback textarea */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
              Feedback
            </label>
            <textarea
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              placeholder="Provide feedback for the student..."
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-gray-300 font-medium hover:bg-slate-700/70 hover:border-slate-600/70 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={() => handleReviewSubmit('FAIL')}
              className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-medium hover:bg-red-500/30 hover:border-red-500/70 transition-all duration-300"
            >
              Mark as Fail
            </button>
            <button
              onClick={() => handleReviewSubmit('REVIEW')}
              className="flex-1 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 font-medium hover:bg-yellow-500/30 hover:border-yellow-500/70 transition-all duration-300"
            >
              Request Review
            </button>
            <button
              onClick={() => handleReviewSubmit('PASS')}
              className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-medium hover:bg-green-500/30 hover:border-green-500/70 transition-all duration-300"
            >
              Approve
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
