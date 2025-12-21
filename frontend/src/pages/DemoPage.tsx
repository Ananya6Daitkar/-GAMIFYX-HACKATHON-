import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Github } from 'lucide-react'
import { AnalysisMetrics } from '../components/Submissions/AnalysisMetrics'

export const DemoPage: React.FC = () => {
  const [step, setStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const steps = [
    { label: 'Push to GitHub', icon: '📤' },
    { label: 'Analyzing...', icon: '🔍' },
    { label: 'Results Ready', icon: '✅' },
  ]

  const handleStartDemo = () => {
    setStep(1)
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setStep(2)
    }, 3000)
  }

  const handleReset = () => {
    setStep(0)
    setIsAnalyzing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 md:px-6 py-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Live Demo</h1>
          <p className="text-gray-400">See GamifyX in action - GitHub push to instant analysis</p>
        </motion.div>

        {/* Demo Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: GitHub Push Simulation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2 font-orbitron flex items-center gap-2">
                <Github className="w-5 h-5 text-cyan-400" />
                GitHub Push
              </h2>
              <p className="text-gray-400 text-sm">Simulating code push to GitHub</p>
            </div>

            {/* Code Preview */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6 font-mono text-sm">
              <div className="text-gray-400 mb-2">$ git push origin main</div>
              <div className="text-green-400">
                <div>Enumerating objects: 5, done.</div>
                <div>Counting objects: 100% (5/5), done.</div>
                <div>Writing objects: 100% (3/3), 245 bytes | 245.00 KiB/s, done.</div>
                <div className="mt-2 text-cyan-400">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✓ Pushed to main
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Commit Info */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-300 space-y-2">
                <div>
                  <span className="text-gray-500">Commit:</span>
                  <span className="text-cyan-400 ml-2 font-mono">a1b2c3d</span>
                </div>
                <div>
                  <span className="text-gray-500">Message:</span>
                  <span className="text-green-400 ml-2">feat: add user authentication</span>
                </div>
                <div>
                  <span className="text-gray-500">Author:</span>
                  <span className="text-magenta-400 ml-2">student@example.com</span>
                </div>
              </div>
            </div>

            {/* Demo Controls */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartDemo}
                disabled={step > 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Start Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-gray-400 hover:text-white font-semibold rounded-lg transition-all duration-300"
              >
                Reset
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Analysis Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2 font-orbitron">Analysis Results</h2>
              <p className="text-gray-400 text-sm">Real-time code analysis</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between mb-4">
                {steps.map((s, idx) => (
                  <motion.div
                    key={idx}
                    className={`flex flex-col items-center gap-2 ${
                      idx <= step ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <motion.div
                      animate={
                        idx === step && isAnalyzing
                          ? { rotate: 360 }
                          : { rotate: 0 }
                      }
                      transition={{
                        duration: 1,
                        repeat: idx === step && isAnalyzing ? Infinity : 0,
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        idx < step
                          ? 'bg-green-500/20 border border-green-500/50'
                          : idx === step
                            ? 'bg-cyan-500/20 border border-cyan-500/50'
                            : 'bg-slate-700/50 border border-slate-600/50'
                      }`}
                    >
                      {s.icon}
                    </motion.div>
                    <span className="text-xs text-gray-400 text-center">{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Metrics Display */}
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* XP Reward */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-4xl mb-2"
                  >
                    ⭐
                  </motion.div>
                  <p className="text-yellow-400 font-bold text-lg">+50 XP Earned!</p>
                  <p className="text-gray-300 text-sm mt-1">Great submission! Keep it up!</p>
                </motion.div>

                {/* Instant Feedback */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3"
                >
                  <p className="text-cyan-400 font-semibold text-sm mb-2">💡 AI Feedback:</p>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>✓ Code structure is clean and well-organized</li>
                    <li>⚠ Consider using async/await instead of callbacks</li>
                    <li>✓ Good error handling implementation</li>
                  </ul>
                </motion.div>

                {/* Metrics */}
                <AnalysisMetrics
                  metrics={{
                    codeQuality: 87,
                    performance: 92,
                    readability: 84,
                    bestPractices: 89,
                  }}
                  isLoading={false}
                />

                {/* Leaderboard Update */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3"
                >
                  <p className="text-green-400 font-semibold text-sm mb-2">🏆 Leaderboard Updated:</p>
                  <div className="flex items-center justify-between text-gray-300 text-xs">
                    <span>Your Rank: #5 → #3</span>
                    <span className="text-green-400 font-bold">↑ 2 positions</span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Loading State */}
            {step === 1 && isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mb-4"
                />
                <p className="text-gray-400 text-center">
                  <div>Analyzing code quality...</div>
                  <div className="text-sm text-gray-500 mt-2">Checking performance, readability, and best practices</div>
                </p>
              </motion.div>
            )}

            {/* Empty State */}
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-gray-400">Click "Start Demo" to see GamifyX in action</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-cyan-500/30 rounded-lg p-6"
        >
          <h3 className="text-lg font-bold text-white mb-3 font-orbitron">How It Works</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">1.</span>
              <span>Student pushes code to GitHub</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">2.</span>
              <span>GamifyX webhook triggers instant analysis</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">3.</span>
              <span>AI analyzes code on 4 dimensions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">4.</span>
              <span>Student gets instant feedback and XP</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">5.</span>
              <span>Teacher sees everything in real-time</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  )
}
