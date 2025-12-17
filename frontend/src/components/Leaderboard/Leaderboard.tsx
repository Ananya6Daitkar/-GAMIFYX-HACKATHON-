import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LeaderboardTable } from './LeaderboardTable'
import { mockLeaderboard } from '../../utils/mockData'
import type { LeaderboardEntry } from '../../types'

type Period = 'daily' | 'weekly' | 'monthly'

interface LeaderboardProps {
  className?: string
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ className = '' }) => {
  const [period, setPeriod] = useState<Period>('daily')
  const [entries] = useState<LeaderboardEntry[]>(mockLeaderboard)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-4 ${className}`}
    >
      {/* Period Filter */}
      <div className="flex gap-3 justify-center md:justify-start" role="group" aria-label="Leaderboard period filter">
        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
          <motion.button
            key={p}
            onClick={() => handlePeriodChange(p)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              period === p
                ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/50'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-cyan-500/20'
            }`}
            aria-pressed={period === p}
            aria-label={`Show ${p} leaderboard`}
          >
            {p}
          </motion.button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && entries.length > 0 && (
        <LeaderboardTable entries={entries} period={period} />
      )}

      {/* Empty State */}
      {!loading && !error && entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-8 text-center"
        >
          <p className="text-gray-400">No leaderboard data available for {period} period</p>
        </motion.div>
      )}
    </motion.div>
  )
}
