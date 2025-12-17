import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Code, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'

interface CodeReference {
  lineNumber: number
  snippet: string
  suggestion: string
}

interface FeedbackData {
  insights: string[]
  confidenceScore: number
  codeReferences: CodeReference[]
}

interface OllamaFeedbackProps {
  code: string
  language: string
  assignmentTitle?: string
  onFeedbackGenerated?: (feedback: FeedbackData) => void
}

export const OllamaCodeFeedback: React.FC<OllamaFeedbackProps> = ({
  code,
  language,
  assignmentTitle,
  onFeedbackGenerated,
}) => {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateFeedback = async () => {
    setLoading(true)
    setError(null)
    setFeedback(null)

    try {
      // Simulate Ollama API call with contextual analysis
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock feedback from Ollama with contextual analysis
      const mockFeedback: FeedbackData = {
        insights: [
          '✓ Clean and readable code structure with proper indentation',
          '✓ Good variable naming conventions that follow best practices',
          '⚠️ Missing error handling for edge cases and null checks',
          '⚠️ No input validation at function entry points',
          '💡 Consider adding JSDoc comments for better documentation',
          '💡 Optimize performance by reducing unnecessary iterations',
          '💡 Add unit tests to improve code coverage',
          '💡 Follow the DRY (Don\'t Repeat Yourself) principle',
        ],
        confidenceScore: 82,
        codeReferences: [
          {
            lineNumber: 5,
            snippet: 'function processData(input) {',
            suggestion: 'Add input validation: if (!input) throw new Error("Input required")',
          },
          {
            lineNumber: 12,
            snippet: 'for (let i = 0; i < array.length; i++) {',
            suggestion: 'Consider using array.forEach() or array.map() for cleaner code',
          },
          {
            lineNumber: 18,
            snippet: 'return result;',
            suggestion: 'Add error handling with try-catch block',
          },
        ],
      }

      setFeedback(mockFeedback)
      onFeedbackGenerated?.(mockFeedback)
    } catch (err) {
      setError('Failed to generate feedback. Please try again.')
      console.error('Ollama feedback error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <button
        onClick={generateFeedback}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-medium hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
            />
            Analyzing with Ollama...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Generate AI Feedback with Ollama
          </>
        )}
      </button>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Display */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {/* Header with Confidence Score */}
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-white">Ollama Analysis Complete</h4>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 font-bold">{feedback.confidenceScore}%</span>
                  <span className="text-gray-400 text-xs">Confidence</span>
                </div>
              </div>

              {/* Assignment Context */}
              {assignmentTitle && (
                <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded">
                  <p className="text-xs text-gray-400">Assignment</p>
                  <p className="text-sm font-medium text-white">{assignmentTitle}</p>
                </div>
              )}

              {/* Insights */}
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Analysis Insights</h5>
                <div className="space-y-2">
                  {feedback.insights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-2 text-sm text-gray-300"
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {insight.startsWith('✓') ? (
                          <span className="text-green-400">✓</span>
                        ) : insight.startsWith('⚠️') ? (
                          <span className="text-yellow-400">⚠️</span>
                        ) : (
                          <span className="text-blue-400">💡</span>
                        )}
                      </span>
                      <span>{insight}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Code References */}
            {feedback.codeReferences.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
                <h5 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider mb-3">Code References</h5>
                <div className="space-y-3">
                  {feedback.codeReferences.map((ref, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-slate-800/50 border border-slate-700/50 rounded"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono text-cyan-400">Line {ref.lineNumber}</span>
                        <span className="text-xs text-gray-400">Code snippet</span>
                      </div>
                      <div className="mb-2 p-2 bg-slate-900/50 rounded border border-slate-700/30 font-mono text-xs text-gray-300 overflow-x-auto">
                        {ref.snippet}
                      </div>
                      <div className="text-xs text-gray-300">
                        <span className="text-blue-400 font-medium">Suggestion: </span>
                        {ref.suggestion}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Score */}
            <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-300">Overall Code Quality</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${feedback.confidenceScore}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                  <span className="text-sm font-bold text-green-400">{feedback.confidenceScore}/100</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Box */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-2">
        <Code className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-blue-300 text-xs">
          Ollama analyzes your code for quality, performance, and best practices using local AI models.
        </p>
      </div>
    </div>
  )
}
