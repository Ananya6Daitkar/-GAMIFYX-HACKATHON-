import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '../../types/index'
import { BadgeCard } from './BadgeCard'
import { CelebrationAnimation } from './CelebrationAnimation'
import { mockBadges } from '../../utils/mockData'
import { ANIMATION_DELAYS } from '../../constants/theme'

interface BadgeGridProps {
  userId?: string
}

interface BadgeWithEarned extends Badge {
  earned: boolean
  earnedAt?: Date
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ userId }) => {
  const [badges] = useState<BadgeWithEarned[]>(
    mockBadges.map((badge, index) => ({
      ...badge,
      earned: index < 2, // First 2 badges are earned
      earnedAt: index < 2 ? new Date(Date.now() - (2 - index) * 24 * 60 * 60 * 1000) : undefined,
    }))
  )
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [celebratingBadgeId, setCelebratingBadgeId] = useState<string | null>(
    null
  )

  const handleBadgeEarned = (badgeId: string) => {
    setCelebratingBadgeId(badgeId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-400">
        {error}
      </div>
    )
  }

  const earnedCount = badges.filter((b) => b.earned).length
  const totalCount = badges.length

  return (
    <div className="w-full">
      {/* Celebration Animation */}
      <CelebrationAnimation
        isVisible={celebratingBadgeId !== null}
        onComplete={() => setCelebratingBadgeId(null)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white font-orbitron mb-2">
          Achievements & Badges
        </h2>
        <p className="text-gray-400">
          {earnedCount} of {totalCount} badges earned
        </p>
        <div className="mt-4 w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500"
          />
        </div>
      </motion.div>

      {/* Badge Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        {badges.map((badge, index) => (
          <div key={badge.id} onClick={() => handleBadgeEarned(badge.id)}>
            <BadgeCard
              badge={badge}
              delay={index * ANIMATION_DELAYS.staggerCard}
            />
          </div>
        ))}
      </motion.div>

      {/* Empty State */}
      {badges.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 text-lg">
            No badges available yet. Keep coding to earn your first badge!
          </p>
        </motion.div>
      )}
    </div>
  )
}
