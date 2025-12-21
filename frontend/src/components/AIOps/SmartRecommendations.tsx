import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, BookOpen, Users, Zap, ArrowRight } from 'lucide-react'

interface Recommendation {
  id: string
  type: 'learning' | 'practice' | 'peer' | 'optimization'
  title: string
  description: string
  reason: string
  action: string
  impact: string
  icon: React.ReactNode
}

export const SmartRecommendations: React.FC = () => {
  const [recommendations] = useState<Recommendation[]>([
    {
      id: '1',
      type: 'learning',
      title: 'Master Async/Await',
      description: 'Your code uses callbacks. Modern JavaScript uses async/await for cleaner code.',
      reason: 'Detected in your last 3 submissions',
      action: 'Start Tutorial',
      impact: '+15 XP when completed',
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
    },
    {
      id: '2',
      type: 'practice',
      title: 'Recursion Practice Problems',
      description: 'You struggled with recursion in the last assignment. Here are 5 curated problems.',
      reason: 'You failed 3 recursion attempts',
      action: 'View Problems',
      impact: '+25 XP per problem',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
    },
    {
      id: '3',
      type: 'peer',
      title: 'Learn from Sarah Chen',
      description: 'Sarah solved the same problem 40% faster. See how she optimized her code.',
      reason: 'Your performance: 65/100 vs Sarah: 92/100',
      action: 'Compare Code',
      impact: '+10 XP for learning',
      icon: <Users className="w-5 h-5 text-green-400" />,
    },
    {
      id: '4',
      type: 'optimization',
      title: 'Optimize Loop Performance',
      description: 'Your nested loop runs 1000+ times. Consider using a hash map instead.',
      reason: 'Performance score: 45/100 (below average)',
      action: 'View Suggestion',
      impact: '+20 XP if implemented',
      icon: <Lightbulb className="w-5 h-5 text-cyan-400" />,
    },
  ])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'learning':
        return 'from-blue-500/10 to-blue-500/5 border-blue-500/30'
      case 'practice':
        return 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/30'
      case 'peer':
        return 'from-green-500/10 to-green-500/5 border-green-500/30'
      case 'optimization':
        return 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/30'
      default:
        return 'from-gray-500/10 to-gray-500/5 border-gray-500/30'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'learning':
        return 'Learning Path'
      case 'practice':
        return 'Practice'
      case 'peer':
        return 'Peer Learning'
      case 'optimization':
        return 'Optimization'
      default:
        return 'Recommendation'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white font-orbitron">Smart Recommendations (AIOps)</h3>
        <span className="ml-auto text-sm text-gray-400">{recommendations.length} personalized</span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`bg-gradient-to-r ${getTypeColor(rec.type)} border rounded-lg p-4 hover:border-opacity-100 transition-all duration-300 cursor-pointer group`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="mt-1">{rec.icon}</div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{rec.reason}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-700/50 rounded text-gray-300 whitespace-nowrap ml-2">
                    {getTypeLabel(rec.type)}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-3">{rec.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-400 font-semibold">{rec.impact}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 text-xs font-semibold transition-all duration-300"
                  >
                    {rec.action}
                    <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mt-6"
      >
        <p className="text-sm text-cyan-300">
          <span className="font-semibold">🤖 AI-Powered Learning:</span> Our AI analyzes your code, identifies weak areas, and recommends personalized learning paths. Each recommendation is tailored to your specific needs and learning style.
        </p>
      </motion.div>
    </div>
  )
}
