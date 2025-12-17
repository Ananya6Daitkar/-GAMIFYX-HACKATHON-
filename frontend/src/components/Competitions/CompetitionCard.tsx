import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Competition } from '../../types'

interface CompetitionCardProps {
  competition: Competition
  isActive: boolean
  onJoin: (competitionId: string) => void
  onViewDetails: (competitionId: string) => void
  isParticipating: boolean
}

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  isActive,
  onJoin,
  onViewDetails,
  isParticipating,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const end = new Date(competition.endTime).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeRemaining('Ended')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [competition.endTime])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'MEDIUM':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'HARD':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      default:
        return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 backdrop-blur-md border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{competition.title}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{competition.description}</p>
        </div>
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="ml-4 w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
          />
        )}
      </div>

      {/* Difficulty Badge */}
      <div className="flex gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(competition.difficulty)}`}>
          {competition.difficulty}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 border border-cyan-500/50 text-cyan-400">
          {competition.xpReward} XP
        </span>
      </div>

      {/* Timer */}
      {isActive && (
        <div className="mb-4 p-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Time Remaining</p>
          <p className="text-lg font-bold text-cyan-400">{timeRemaining}</p>
        </div>
      )}

      {/* Status */}
      {!isActive && (
        <div className="mb-4 p-3 bg-slate-900/50 border border-gray-500/30 rounded-lg">
          <p className="text-xs text-gray-400">Status</p>
          <p className="text-lg font-bold text-gray-400">Ended</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewDetails(competition.id)}
          className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600 transition-all font-medium text-sm"
        >
          Details
        </motion.button>
        {isActive && !isParticipating && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onJoin(competition.id)}
            className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-lg shadow-cyan-500/50 transition-all font-bold text-sm"
          >
            Join
          </motion.button>
        )}
        {isParticipating && (
          <motion.button
            disabled
            className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50 font-bold text-sm cursor-default"
          >
            Joined
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
