import React from 'react'
import { motion } from 'framer-motion'
import { Brain, AlertCircle, Lightbulb } from 'lucide-react'
import { PredictiveAlerts } from '../components/AIOps/PredictiveAlerts'
import { SmartRecommendations } from '../components/AIOps/SmartRecommendations'

export const AIOpsPage: React.FC = () => {
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
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white font-orbitron">AIOps Intelligence</h1>
          </div>
          <p className="text-gray-400">AI-powered monitoring, alerts, and personalized recommendations</p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-white">Predictive Alerts</h3>
            </div>
            <p className="text-sm text-gray-300">AI detects at-risk students before they fall behind</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white">Smart Recommendations</h3>
            </div>
            <p className="text-sm text-gray-300">Personalized learning paths based on performance</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">Real-time Analysis</h3>
            </div>
            <p className="text-sm text-gray-300">Continuous monitoring of all student activity</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Predictive Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md"
          >
            <PredictiveAlerts />
          </motion.div>

          {/* Smart Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md"
          >
            <SmartRecommendations />
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-cyan-500/30 rounded-lg p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 font-orbitron">How AIOps Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">1. Monitor</span>
                <br />
                AI tracks all student activity
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">2. Analyze</span>
                <br />
                Identifies patterns & risks
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚨</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">3. Alert</span>
                <br />
                Sends instant notifications
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💡</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">4. Recommend</span>
                <br />
                Suggests personalized actions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 font-orbitron">AIOps Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">For Students</p>
                <p className="text-sm text-gray-300">Get personalized guidance and catch problems early</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">For Teachers</p>
                <p className="text-sm text-gray-300">Identify at-risk students automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">Real-time Insights</p>
                <p className="text-sm text-gray-300">Monitor progress 24/7 without manual effort</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">Improved Outcomes</p>
                <p className="text-sm text-gray-300">Early intervention leads to better completion rates</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
