import React from 'react'
import { motion } from 'framer-motion'
import type { LeaderboardEntry } from '../../types'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  period: 'daily' | 'weekly' | 'monthly'
}

const getMedalColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'text-yellow-400'
    case 2:
      return 'text-gray-300'
    case 3:
      return 'text-orange-400'
    default:
      return 'text-gray-500'
  }
}

const getMedalEmoji = (rank: number): string => {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
  }
}

const getRowHighlight = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'bg-yellow-500/10 border-l-4 border-yellow-400'
    case 2:
      return 'bg-gray-400/5 border-l-4 border-gray-300'
    case 3:
      return 'bg-orange-500/10 border-l-4 border-orange-400'
    default:
      return ''
  }
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  period,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-lg overflow-hidden backdrop-blur-md"
    >
      <div className="p-6 border-b border-cyan-500/20">
        <h2 className="text-2xl font-bold text-white font-orbitron">
          Leaderboard ({period})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cyan-500/20">
              <th className="px-6 py-3 text-left text-gray-400 font-medium">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-gray-400 font-medium">
                Player
              </th>
              <th className="px-6 py-3 text-left text-gray-400 font-medium">
                XP
              </th>
              <th className="px-6 py-3 text-left text-gray-400 font-medium">
                Streak
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <motion.tr
                key={`${entry.rank}-${entry.userId}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-all ${getRowHighlight(entry.rank)}`}
              >
                <td className={`px-6 py-4 font-bold text-lg ${getMedalColor(entry.rank)}`}>
                  {getMedalEmoji(entry.rank)} #{entry.rank}
                </td>
                <td className="px-6 py-4 text-white font-medium">{entry.username}</td>
                <td className="px-6 py-4 text-cyan-400 font-semibold">
                  {entry.xp} XP
                </td>
                <td className="px-6 py-4 text-magenta-400">{entry.streak}🔥</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
