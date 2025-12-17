import React from 'react'
import { motion } from 'framer-motion'
import { Assignment } from '../../types'

interface AssignmentCardProps {
  assignment: Assignment
  isAccepted?: boolean
  onAccept?: () => void
  onViewDetails?: () => void
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'EASY':
      return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' }
    case 'MEDIUM':
      return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' }
    case 'HARD':
      return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' }
    default:
      return { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' }
  }
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const isDeadlinePassed = (deadline: Date | string) => {
  return new Date(deadline) < new Date()
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  isAccepted = false,
  onAccept,
  onViewDetails,
}) => {
  const difficultyInfo = getDifficultyColor(assignment.difficulty)
  const deadlinePassed = isDeadlinePassed(assignment.deadline)

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      {/* Neon glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg overflow-hidden hover:border-cyan-500/40 transition-all duration-300 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">
              {assignment.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {assignment.description}
            </p>
          </div>
          {isAccepted && (
            <div className="ml-4 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs font-semibold">
              Accepted
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Difficulty badge */}
          <div
            className={`px-3 py-1 rounded text-xs font-semibold ${difficultyInfo.bg} border ${difficultyInfo.border} ${difficultyInfo.text}`}
          >
            {assignment.difficulty}
          </div>

          {/* XP reward */}
          <div className="px-3 py-1 rounded text-xs font-semibold bg-purple-500/20 border border-purple-500/50 text-purple-400">
            +{assignment.xpReward} XP
          </div>

          {/* Deadline */}
          <div
            className={`px-3 py-1 rounded text-xs font-semibold ${
              deadlinePassed
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
            }`}
          >
            {deadlinePassed ? 'Deadline Passed' : `Due ${formatDate(assignment.deadline)}`}
          </div>
        </div>

        {/* Required files */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Required Files</p>
          <div className="flex flex-wrap gap-2">
            {assignment.requiredFiles.map((file, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-xs text-gray-300 font-mono"
              >
                {file}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onViewDetails}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-500/70 transition-all duration-300"
          >
            View Details
          </button>
          {!isAccepted && (
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-magenta-500/20 to-pink-500/20 border border-magenta-500/50 rounded-lg text-magenta-400 font-medium hover:from-magenta-500/30 hover:to-pink-500/30 hover:border-magenta-500/70 transition-all duration-300"
            >
              Accept
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
