import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GitHubIntegration } from '../components/GitHub/GitHubIntegration'
import { OllamaCodeFeedback } from '../components/Ollama/OllamaCodeFeedback'
import { mockAssignments } from '../utils/mockData'

interface Assignment {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  xpReward: number
  requiredFiles: string[]
  expectedFolderStructure: string
  deadline: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export const AssignmentsPage: React.FC = () => {
  const [assignments] = useState<Assignment[]>(mockAssignments)
  const [githubConnected] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submittingRepo, setSubmittingRepo] = useState<string | null>(null)
  const [repoUrl, setRepoUrl] = useState('')
  const [showCodeSubmission, setShowCodeSubmission] = useState(false)
  const [submissionCode, setSubmissionCode] = useState('')
  const [submissionLanguage, setSubmissionLanguage] = useState('javascript')

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'MEDIUM':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'HARD':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '⭐'
      case 'MEDIUM':
        return '⭐⭐'
      case 'HARD':
        return '⭐⭐⭐'
      default:
        return '⭐'
    }
  }

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!repoUrl.trim()) {
      alert('Please enter a GitHub repository URL')
      return
    }

    setSubmittingRepo(assignmentId)
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('Assignment submitted successfully! Your code will be auto-graded.')
      setRepoUrl('')
      setSelectedAssignment(null)
    } catch (error) {
      alert('Failed to submit assignment')
    } finally {
      setSubmittingRepo(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 md:px-6 py-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Assignments</h1>
          <p className="text-gray-400">Complete assignments and earn XP rewards</p>
        </motion.div>

        {/* GitHub Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <GitHubIntegration
            isConnected={githubConnected}
            username="testuser"
            onConnect={() => console.log('Connect GitHub')}
            onDisconnect={() => console.log('Disconnect GitHub')}
          />
        </motion.div>

        {/* Assignments Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Card */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all duration-300 h-full flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white flex-1">{assignment.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(assignment.difficulty)}`}>
                      {getDifficultyIcon(assignment.difficulty)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{assignment.description}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">XP Reward:</span>
                    <span className="text-cyan-400 font-semibold">{assignment.xpReward} XP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className="text-gray-300">{assignment.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Deadline:</span>
                    <span className="text-gray-300">{new Date(assignment.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Required Files */}
                <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded">
                  <p className="text-xs text-gray-400 mb-2">Required Files:</p>
                  <div className="flex flex-wrap gap-2">
                    {assignment.requiredFiles.map((file, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-gray-300">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setSelectedAssignment(assignment)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-500/70 transition-all duration-300"
                >
                  Submit Assignment
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Submission Modal */}
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 max-w-2xl w-full border border-cyan-500/30 shadow-lg shadow-cyan-500/20 my-8"
            >
              <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">
                {selectedAssignment.title}
              </h2>
              <p className="text-gray-400 mb-6">Choose your submission method</p>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-slate-700">
                <button
                  onClick={() => setShowCodeSubmission(false)}
                  className={`px-4 py-2 font-medium transition-all duration-300 ${
                    !showCodeSubmission
                      ? 'text-cyan-400 border-b-2 border-cyan-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🐙 GitHub Repository
                </button>
                <button
                  onClick={() => setShowCodeSubmission(true)}
                  className={`px-4 py-2 font-medium transition-all duration-300 ${
                    showCodeSubmission
                      ? 'text-purple-400 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  💻 Direct Code
                </button>
              </div>

              {/* GitHub Submission */}
              {!showCodeSubmission && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repo"
                      className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 transition-all duration-300"
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                      💡 Make sure your repository contains all required files and follows the expected folder structure.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedAssignment(null)}
                      className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitAssignment(selectedAssignment.id)}
                      disabled={submittingRepo === selectedAssignment.id}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submittingRepo === selectedAssignment.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          Submit
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Direct Code Submission */}
              {showCodeSubmission && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Programming Language
                    </label>
                    <select
                      value={submissionLanguage}
                      onChange={(e) => setSubmissionLanguage(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/70 transition-all duration-300"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Code
                    </label>
                    <textarea
                      value={submissionCode}
                      onChange={(e) => setSubmissionCode(e.target.value)}
                      placeholder="Paste your code here..."
                      className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 transition-all duration-300 font-mono text-sm h-48 resize-none"
                    />
                  </div>

                  {/* Ollama Feedback */}
                  {submissionCode && (
                    <OllamaCodeFeedback
                      code={submissionCode}
                      language={submissionLanguage}
                      onFeedbackGenerated={(feedback) => {
                        console.log('Ollama feedback:', feedback)
                      }}
                    />
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedAssignment(null)}
                      className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (submissionCode.trim()) {
                          alert('Code submitted successfully! Ollama will analyze it.')
                          setSubmissionCode('')
                          setSelectedAssignment(null)
                        } else {
                          alert('Please enter some code')
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span>⚡</span>
                      Submit & Analyze
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
