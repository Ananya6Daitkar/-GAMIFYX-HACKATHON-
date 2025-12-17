import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Competition, CompetitionResult } from '../../types'
import { api } from '../../utils/api'

interface CompetitionDetailsProps {
  competition: Competition
  onClose: () => void
}

export const CompetitionDetails: React.FC<CompetitionDetailsProps> = ({ competition, onClose }) => {
  const [results, setResults] = useState<CompetitionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.get(`/competitions/${competition.id}/results`)
        setResults(data.results || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [competition.id])

  const isEnded = new Date() > new Date(competition.endTime)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 border border-cyan-500/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-cyan-500/20 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{competition.title}</h2>
            <p className="text-gray-400">{competition.description}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Difficulty</p>
              <p className="text-lg font-bold text-cyan-400">{competition.difficulty}</p>
            </div>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">XP Reward</p>
              <p className="text-lg font-bold text-cyan-400">{competition.xpReward}</p>
            </div>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <p className={`text-lg font-bold ${isEnded ? 'text-red-400' : 'text-green-400'}`}>
                {isEnded ? 'Ended' : 'Active'}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Participants</p>
              <p className="text-lg font-bold text-cyan-400">{results.length}</p>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Rules</h3>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{competition.rules}</p>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Requirements</h3>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{competition.requirements}</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">
              {isEnded ? 'Final Results' : 'Current Standings'}
            </h3>

            {loading && (
              <div className="flex justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
                />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400"
              >
                {error}
              </motion.div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <motion.div
                    key={result.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      index === 0
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : index === 1
                          ? 'bg-gray-400/10 border-gray-400/30'
                          : index === 2
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-slate-900/50 border-cyan-500/20'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 font-bold text-white">
                      {result.rank}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-white">{result.username}</p>
                      <p className="text-xs text-gray-400">
                        {result.submissionCount} submissions • Score: {result.qualityScore}
                      </p>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <p className="font-bold text-cyan-400">{result.xpEarned} XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-8 text-center"
              >
                <p className="text-gray-400">No participants yet</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
