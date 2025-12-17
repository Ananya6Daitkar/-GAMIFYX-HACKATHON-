import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FeedbackForm } from './FeedbackForm'
import { FeedbackHistory } from './FeedbackHistory'

export const Feedback: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'ai'>('send')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex gap-3 mb-8 flex-wrap"
      >
        <button
          onClick={() => setActiveTab('send')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'send'
              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/70 text-cyan-400 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-700/50 border border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500/70'
          }`}
        >
          <span>✉️</span>
          Send Feedback
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/70 text-cyan-400 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-700/50 border border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500/70'
          }`}
        >
          <span>📋</span>
          History
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-magenta-500/30 to-pink-500/30 border border-magenta-500/70 text-magenta-400 shadow-lg shadow-magenta-500/20'
              : 'bg-slate-700/50 border border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500/70'
          }`}
        >
          <span>🤖</span>
          AI Feedback
        </button>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'send' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-6 font-orbitron">Send Feedback</h2>
            <p className="text-gray-400 mb-6">Help us improve by sharing your thoughts, suggestions, or reporting issues.</p>
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <span>✉️</span>
              Open Feedback Form
            </button>
          </div>
        )}

        {/* Feedback Form Modal */}
        {showFeedbackForm && (
          <FeedbackForm
            isOpen={showFeedbackForm}
            onClose={() => setShowFeedbackForm(false)}
            onSuccess={(ticketNumber) => {
              console.log('Feedback submitted with ticket:', ticketNumber)
            }}
          />
        )}

        {activeTab === 'history' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-6 font-orbitron">Feedback History</h2>
            <p className="text-gray-400 mb-6">Track all your feedback submissions and their status.</p>
            <FeedbackHistory />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-magenta-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">🤖 AI Feedback Generator</h2>
            <p className="text-gray-400 mb-6">Get AI-powered feedback on your code submissions using Ollama (Mistral 7B)</p>
            
            <div className="space-y-6">
              {/* AI Feedback Info */}
              <div className="bg-slate-800/50 border border-magenta-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-magenta-400 mb-4">How it works:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-magenta-400 font-bold">1.</span>
                    <span>Submit your code for analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-magenta-400 font-bold">2.</span>
                    <span>Our AI analyzes your code using Mistral 7B</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-magenta-400 font-bold">3.</span>
                    <span>Receive detailed feedback with suggestions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-magenta-400 font-bold">4.</span>
                    <span>Confidence score shows feedback reliability</span>
                  </li>
                </ul>
              </div>

              {/* AI Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
                  <h4 className="text-cyan-400 font-semibold mb-2">✨ Code Analysis</h4>
                  <p className="text-gray-400 text-sm">Analyzes code quality, best practices, and potential issues</p>
                </div>
                <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">⚡ Real-time Processing</h4>
                  <p className="text-gray-400 text-sm">Get feedback instantly with timeout fallback</p>
                </div>
                <div className="bg-slate-800/50 border border-magenta-500/30 rounded-lg p-4">
                  <h4 className="text-magenta-400 font-semibold mb-2">📊 Confidence Scoring</h4>
                  <p className="text-gray-400 text-sm">Know how confident the AI is in its feedback</p>
                </div>
                <div className="bg-slate-800/50 border border-pink-500/30 rounded-lg p-4">
                  <h4 className="text-pink-400 font-semibold mb-2">🎯 Actionable Insights</h4>
                  <p className="text-gray-400 text-sm">Get specific suggestions for improvement</p>
                </div>
              </div>

              {/* AI Status */}
              <div className="bg-gradient-to-r from-magenta-500/10 to-pink-500/10 border border-magenta-500/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <h4 className="text-lg font-semibold text-white">Ollama Integration Active</h4>
                </div>
                <p className="text-gray-300 mb-4">
                  AI feedback is powered by Mistral 7B running locally via Ollama. This ensures privacy and fast processing.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Model</p>
                    <p className="text-cyan-400 font-semibold">Mistral 7B</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Timeout</p>
                    <p className="text-cyan-400 font-semibold">10 seconds</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate('/assignments')}
                className="w-full px-6 py-3 bg-gradient-to-r from-magenta-500 to-pink-500 hover:from-magenta-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                Go to Assignments to Get AI Feedback
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
