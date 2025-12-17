import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Assignment } from '../../types'

interface AcceptAssignmentModalProps {
  isOpen: boolean
  assignment: Assignment
  onClose: () => void
  onSubmit: (repoUrl: string, branch: string) => void
}

export const AcceptAssignmentModal: React.FC<AcceptAssignmentModalProps> = ({
  isOpen,
  assignment,
  onClose,
  onSubmit,
}) => {
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate repo URL
    if (!repoUrl.trim()) {
      setError('GitHub repository URL is required')
      return
    }

    // Basic GitHub URL validation
    if (!repoUrl.includes('github.com')) {
      setError('Please enter a valid GitHub repository URL')
      return
    }

    if (!branch.trim()) {
      setError('Branch name is required')
      return
    }

    setLoading(true)
    try {
      onSubmit(repoUrl, branch)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRepoUrl('')
    setBranch('main')
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            {/* Neon glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 rounded-lg blur-xl" />

            {/* Modal content */}
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-cyan-500/30 rounded-lg p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Accept Assignment
                </h2>
                <p className="text-gray-400 text-sm">
                  {assignment.title}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* GitHub Repo URL */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the URL of your GitHub repository for this assignment
                  </p>
                </div>

                {/* Branch selection */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The branch where your assignment code will be pushed (default: main)
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-gray-300 font-medium hover:bg-slate-700/70 hover:border-slate-600/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-magenta-500/20 to-pink-500/20 border border-magenta-500/50 rounded-lg text-magenta-400 font-medium hover:from-magenta-500/30 hover:to-pink-500/30 hover:border-magenta-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-4 h-4 border-2 border-magenta-500 border-t-transparent rounded-full"
                        />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        Accept Assignment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
