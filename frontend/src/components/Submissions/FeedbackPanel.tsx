import React from 'react'
import { motion } from 'framer-motion'
import { AIFeedback } from '../../types'

interface FeedbackPanelProps {
  feedback: AIFeedback
}

const getConfidenceColor = (score: number) => {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-orange-400'
}

const getConfidenceLabel = (score: number) => {
  if (score >= 80) return 'High'
  if (score >= 60) return 'Medium'
  return 'Low'
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Confidence score */}
      <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Confidence Score</span>
          <span className={`text-lg font-bold ${getConfidenceColor(feedback.confidenceScore)}`}>
            {feedback.confidenceScore}%
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(feedback.confidenceScore)} bg-slate-900/50`}>
          {getConfidenceLabel(feedback.confidenceScore)}
        </span>
      </div>

      {/* Disclaimer for low confidence */}
      {feedback.confidenceScore < 50 && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-sm">
          ⚠️ This feedback has lower confidence. Please review carefully.
        </div>
      )}

      {/* Insights */}
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
          Insights
        </h4>
        <div className="space-y-2">
          {feedback.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3 p-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg"
            >
              <span className="text-green-400 font-bold flex-shrink-0">✓</span>
              <p className="text-gray-300 text-sm">{insight}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Code references */}
      {feedback.codeReferences.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
            Code References
          </h4>
          <div className="space-y-3">
            {feedback.codeReferences.map((ref, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-cyan-500/20 rounded-lg overflow-hidden"
              >
                {/* Line number header */}
                <div className="bg-slate-800/50 px-3 py-2 border-b border-cyan-500/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400">
                    Line {ref.lineNumber}
                  </span>
                </div>

                {/* Code snippet */}
                <div className="bg-slate-900/50 px-3 py-2">
                  <pre className="font-mono text-xs text-gray-300 overflow-x-auto">
                    {ref.snippet}
                  </pre>
                </div>

                {/* Suggestion */}
                <div className="bg-orange-500/5 px-3 py-2 border-t border-cyan-500/10">
                  <p className="text-xs text-orange-400 font-medium mb-1">
                    Suggestion:
                  </p>
                  <p className="text-xs text-gray-300">{ref.suggestion}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Generated timestamp */}
      <div className="text-xs text-gray-500 text-right">
        Generated {new Date(feedback.generatedAt).toLocaleDateString()}
      </div>
    </motion.div>
  )
}
