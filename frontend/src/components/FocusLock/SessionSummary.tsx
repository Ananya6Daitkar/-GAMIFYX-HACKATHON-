import React from 'react'
import { motion } from 'framer-motion'

interface SessionSummaryProps {
  duration: number // in seconds
  xpEarned: number
  streakBonus: number
  onClose: () => void
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  duration,
  xpEarned,
  streakBonus,
  onClose,
}) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-lg p-8 max-w-md backdrop-blur-md"
      >
        {/* Celebration animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-6xl text-center mb-6"
        >
          🎉
        </motion.div>

        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-orbitron text-center mb-8">
          Session Complete!
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 mb-8"
        >
          {/* Duration */}
          <motion.div variants={itemVariants} className="flex justify-between items-center">
            <span className="text-gray-400">Focus Duration</span>
            <span className="text-2xl font-bold text-cyan-400">
              {formatTime(duration)}
            </span>
          </motion.div>

          {/* Base XP */}
          <motion.div variants={itemVariants} className="flex justify-between items-center">
            <span className="text-gray-400">Base XP</span>
            <span className="text-xl text-gray-300">
              {Math.ceil(duration / 60)} XP
            </span>
          </motion.div>

          {/* Streak Bonus */}
          {streakBonus > 0 && (
            <motion.div variants={itemVariants} className="flex justify-between items-center">
              <span className="text-gray-400">Streak Bonus</span>
              <span className="text-xl text-magenta-400">
                +{Math.floor(streakBonus * 100)}%
              </span>
            </motion.div>
          )}

          {/* Total XP */}
          <motion.div
            variants={itemVariants}
            className="flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4"
          >
            <span className="text-gray-300 font-bold">Total XP Earned</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-3xl font-bold text-cyan-400"
            >
              +{xpEarned}
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Motivational message */}
        <motion.p
          variants={itemVariants}
          className="text-center text-gray-400 text-sm mb-8"
        >
          Great focus session! Keep up the momentum! 🚀
        </motion.p>

        {/* Close button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
        >
          Back to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
