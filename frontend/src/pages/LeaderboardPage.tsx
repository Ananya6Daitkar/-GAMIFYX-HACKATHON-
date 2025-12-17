import React from 'react'
import { motion } from 'framer-motion'
import { Leaderboard } from '../components/Leaderboard/Leaderboard'

export const LeaderboardPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 md:px-6 py-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Leaderboard</h1>
          <p className="text-gray-400">Compete with other students and climb the ranks</p>
        </motion.div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md">
          <Leaderboard />
        </div>
      </div>
    </motion.div>
  )
}
