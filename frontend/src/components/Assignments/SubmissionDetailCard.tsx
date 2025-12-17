import React from 'react'
import { motion } from 'framer-motion'
import { AssignmentSubmission, AIFeedback } from '../../types'
import { FeedbackPanel } from '../Submissions/FeedbackPanel'

interface SubmissionDetailCardProps {
  submission: AssignmentSubmission
  feedback?: AIFeedback
}

const GradingBreakdownItem: React.FC<{
  label: string
  score: number
}> = ({ label, score }) => {
  const percentage = Math.min(100, Math.max(0, score))
  const color = percentage >= 80 ? 'from-green-500' : percentage >= 50 ? 'from-yellow-500' : 'from-red-500'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-cyan-400 font-semibold">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${color} to-transparent`}
        />
      </div>
    </div>
  )
}

export const SubmissionDetailCard: React.FC<SubmissionDetailCardProps> = ({
  submission,
  feedback,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="space-y-6">
      {/* Auto-grading breakdown */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-sm font-semibold text-cyan-400 mb-4 uppercase tracking-wider">
          Auto-Grading Breakdown
        </h3>
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <GradingBreakdownItem
              label="Commit Message Quality"
              score={submission.autoGradingBreakdown.commitMessageQuality}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GradingBreakdownItem
              label="Number of Commits"
              score={submission.autoGradingBreakdown.commitCount}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GradingBreakdownItem
              label="Lines Added/Removed Balance"
              score={submission.autoGradingBreakdown.linesBalance}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GradingBreakdownItem
              label="Required Files Present"
              score={submission.autoGradingBreakdown.requiredFilesPresent}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GradingBreakdownItem
              label="Folder Structure"
              score={submission.autoGradingBreakdown.folderStructure}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GradingBreakdownItem
              label="README Quality"
              score={submission.autoGradingBreakdown.readmeQuality}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Overall score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-cyan-500/30 rounded-lg"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Overall Score</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400">
                {submission.score}%
              </div>
              <div className="text-xs text-gray-400">
                {submission.status}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* XP earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">XP Earned</span>
          <div className="text-2xl font-bold text-purple-400">
            +{submission.xpEarned}
          </div>
        </div>
      </motion.div>

      {/* AI Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
            AI Feedback
          </h3>
          <FeedbackPanel feedback={feedback} />
        </motion.div>
      )}

      {/* Repository info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg"
      >
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Repository Details
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Repository:</span>
            <p className="text-cyan-400 font-mono break-all">{submission.githubRepoUrl}</p>
          </div>
          <div>
            <span className="text-gray-500">Branch:</span>
            <p className="text-cyan-400 font-mono">{submission.branch}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
