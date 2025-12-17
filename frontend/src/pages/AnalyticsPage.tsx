import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, Target, Award } from 'lucide-react'
import { Analytics } from '../components/Analytics/Analytics'

export const AnalyticsPage: React.FC = () => {
  // Quick stats
  const stats = [
    { label: 'Total XP', value: '2,450', icon: Zap, color: 'from-cyan-500 to-blue-500' },
    { label: 'Current Level', value: '12', icon: Target, color: 'from-purple-500 to-pink-500' },
    { label: 'Assignments Done', value: '23', icon: Award, color: 'from-green-500 to-emerald-500' },
    { label: 'Streak Days', value: '7', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ]

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
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Analytics</h1>
          <p className="text-gray-400">Track your progress, skills, and learning journey</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-lg blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

                {/* Card */}
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Main Analytics */}
        <Analytics />
      </div>
    </motion.div>
  )
}
