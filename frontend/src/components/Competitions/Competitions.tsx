import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CompetitionCard } from './CompetitionCard'
import { CompetitionDetails } from './CompetitionDetails'
import { api } from '../../utils/api'
import type { Competition } from '../../types'

interface CompetitionsProps {
  className?: string
}

export const Competitions: React.FC<CompetitionsProps> = ({ className = '' }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [participatingIds, setParticipatingIds] = useState<Set<string>>(new Set())
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all')

  useEffect(() => {
    fetchCompetitions()
    fetchParticipations()
  }, [])

  const fetchCompetitions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get('/competitions')
      setCompetitions(data.competitions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitions')
      setCompetitions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipations = async () => {
    try {
      const data = await api.get('/competitions/my-participations')
      const ids = new Set<string>(data.participations?.map((p: { competitionId: string }) => p.competitionId) || [])
      setParticipatingIds(ids)
    } catch (err) {
      console.error('Failed to fetch participations:', err)
    }
  }

  const handleJoin = async (competitionId: string) => {
    try {
      await api.post(`/competitions/${competitionId}/join`, {})
      setParticipatingIds((prev) => new Set([...prev, competitionId]))
    } catch (err) {
      console.error('Failed to join competition:', err)
    }
  }

  const isCompetitionActive = (competition: Competition) => {
    const now = new Date()
    return now < new Date(competition.endTime)
  }

  const filteredCompetitions = competitions.filter((comp) => {
    if (filter === 'active') return isCompetitionActive(comp)
    if (filter === 'ended') return !isCompetitionActive(comp)
    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Competitions</h2>
          <p className="text-gray-400">Challenge yourself and compete with peers</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3">
        {(['all', 'active', 'ended'] as const).map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === f
                ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/50'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-cyan-500/20'
            }`}
          >
            {f}
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

      {/* Competitions Grid */}
      {!loading && !error && filteredCompetitions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCompetitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                isActive={isCompetitionActive(competition)}
                onJoin={handleJoin}
                onViewDetails={() => setSelectedCompetition(competition)}
                isParticipating={participatingIds.has(competition.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCompetitions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-12 text-center"
        >
          <p className="text-gray-400 mb-4">No {filter !== 'all' ? filter : ''} competitions available</p>
          <p className="text-sm text-gray-500">Check back soon for new challenges!</p>
        </motion.div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedCompetition && (
          <CompetitionDetails
            competition={selectedCompetition}
            onClose={() => setSelectedCompetition(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
