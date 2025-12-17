import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '../../types/index'

interface BadgeCardProps {
  badge: Badge & { earned?: boolean; earnedAt?: Date }
  delay?: number
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, delay = 0 }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const isEarned = badge.earned ?? false

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative"
    >
      {/* Badge Container */}
      <div
        className={`
          relative w-24 h-24 rounded-lg flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${
            isEarned
              ? 'bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-700/30 border border-slate-600/30 opacity-60'
          }
          hover:scale-110 hover:shadow-xl
        `}
      >
        {/* Badge Icon */}
        <div
          className={`
            text-4xl transition-all duration-300
            ${isEarned ? 'filter-none' : 'grayscale opacity-50'}
          `}
        >
          {badge.icon}
        </div>

        {/* Glow Effect for Earned Badges */}
        {isEarned && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-lg bg-cyan-500/10 pointer-events-none"
          />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50
            bg-slate-900 border border-cyan-500/50 rounded-lg p-3 w-48
            shadow-lg shadow-cyan-500/20 backdrop-blur-md"
        >
          <h3 className="text-sm font-bold text-cyan-400 font-orbitron">
            {badge.name}
          </h3>
          <p className="text-xs text-gray-300 mt-1">{badge.description}</p>
          <p className="text-xs text-gray-400 mt-2 italic">
            Criteria: {badge.criteria}
          </p>
          {isEarned && badge.earnedAt && (
            <p className="text-xs text-green-400 mt-2">
              Earned: {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
