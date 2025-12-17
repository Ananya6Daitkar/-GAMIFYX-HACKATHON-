import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LeaderboardEntry } from '../../types'

interface ClassOverviewData {
  totalStudents: number
  averageXp: number
  classLeaderboard: LeaderboardEntry[]
}

const mockClassOverview: ClassOverviewData = {
  totalStudents: 25,
  averageXp: 450,
  classLeaderboard: [
    { rank: 1, userId: 'user1', username: 'AlexCoder', xp: 850, streak: 12 },
    { rank: 2, userId: 'user2', username: 'DevMaster', xp: 720, streak: 8 },
    { rank: 3, userId: 'user3', username: 'CodeNinja', xp: 650, streak: 10 },
    { rank: 4, userId: 'user4', username: 'WebWizard', xp: 580, streak: 6 },
    { rank: 5, userId: 'user5', username: 'DataDriven', xp: 520, streak: 5 },
  ],
}

export const ClassOverview: React.FC = () => {
  const [overview] = useState<ClassOverviewData>(mockClassOverview)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-400">
        {error || 'Failed to load class overview'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Total Students Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Students</p>
                <p className="text-4xl font-bold text-cyan-400">{overview.totalStudents}</p>
              </div>
              <div className="text-5xl opacity-20">👥</div>
            </div>
          </div>
        </div>

        {/* Average XP Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-magenta-500/10 to-pink-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-magenta-500/20 rounded-lg p-6 hover:border-magenta-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Average XP</p>
                <p className="text-4xl font-bold text-magenta-400">{overview.averageXp}</p>
              </div>
              <div className="text-5xl opacity-20">⭐</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Class Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 font-orbitron">Class Leaderboard</h3>
        
        <div className="space-y-3">
          {overview.classLeaderboard.map((entry, index) => {
            const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•'
            const medalColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-500'

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-700/30 border border-slate-600/50 rounded hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className={`text-2xl ${medalColor}`}>{medalEmoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{entry.username}</p>
                    <p className="text-gray-400 text-sm">Level {Math.floor(entry.xp / 100) + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-bold">{entry.xp} XP</p>
                  <p className="text-gray-400 text-sm">Rank #{entry.rank}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
