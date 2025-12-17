import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Assignment } from '../../types'

interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'MEDIUM' as const,
    xpReward: 100,
    requiredFiles: '',
    expectedFolderStructure: '',
    deadline: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'xpReward' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Assignment title is required')
      return
    }
    if (!formData.description.trim()) {
      setError('Assignment description is required')
      return
    }
    if (formData.xpReward < 10) {
      setError('XP reward must be at least 10')
      return
    }
    if (!formData.deadline) {
      setError('Deadline is required')
      return
    }
    if (new Date(formData.deadline) <= new Date()) {
      setError('Deadline must be in the future')
      return
    }

    setLoading(true)
    try {
      const requiredFiles = formData.requiredFiles
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0)

      onSubmit({
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        xpReward: formData.xpReward,
        requiredFiles,
        expectedFolderStructure: formData.expectedFolderStructure,
        deadline: new Date(formData.deadline),
        createdBy: '', // Will be set by backend
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: 'MEDIUM',
        xpReward: 100,
        requiredFiles: '',
        expectedFolderStructure: '',
        deadline: '',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'MEDIUM',
      xpReward: 100,
      requiredFiles: '',
      expectedFolderStructure: '',
      deadline: '',
    })
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
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Neon glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 rounded-lg blur-xl" />

            {/* Modal content */}
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-cyan-500/30 rounded-lg p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Create New Assignment
                </h2>
                <p className="text-gray-400 text-sm">
                  Set up a new assignment for your students
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Build a Todo App"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the assignment requirements..."
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Difficulty and XP */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      name="xpReward"
                      value={formData.xpReward}
                      onChange={handleChange}
                      min="10"
                      step="10"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Required Files */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                    Required Files (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="requiredFiles"
                    value={formData.requiredFiles}
                    onChange={handleChange}
                    placeholder="e.g., index.html, style.css, script.js"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                  />
                </div>

                {/* Folder Structure */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                    Expected Folder Structure
                  </label>
                  <textarea
                    name="expectedFolderStructure"
                    value={formData.expectedFolderStructure}
                    onChange={handleChange}
                    placeholder="e.g., src/\n  components/\n  utils/"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200 resize-none font-mono text-sm"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                  />
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <span>+</span>
                        Create Assignment
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
