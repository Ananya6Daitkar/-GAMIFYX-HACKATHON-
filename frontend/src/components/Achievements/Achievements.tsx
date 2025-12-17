import React from 'react'
import { motion } from 'framer-motion'
import { BadgeGrid } from './BadgeGrid'

interface AchievementsProps {
  userId?: string
}

export const Achievements: React.FC<AchievementsProps> = ({ userId }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-8 backdrop-blur-md">
        <BadgeGrid userId={userId} />
      </div>
    </motion.div>
  )
}
