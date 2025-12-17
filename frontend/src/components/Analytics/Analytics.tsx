import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ActivityChart } from './ActivityChart'
import { SkillChart } from './SkillChart'
import { ProgressChart } from './ProgressChart'
import { AnalyticsBarChart } from './BarChart'
import { AnalyticsPieChart } from './PieChart'
import { mockAnalyticsData } from '../../utils/mockData'
import { ANIMATION_DELAYS } from '../../constants/theme'

export interface ActivityData {
  date: string
  submissionCount: number
  xpEarned: number
}

export interface SkillData {
  language: string
  proficiency: number
}

export interface ProgressData {
  date: string
  totalXP: number
  level: number
}

export const Analytics: React.FC = () => {
  const [activityData] = useState<any[]>(mockAnalyticsData.activityChart)
  const [skillData] = useState<any[]>(mockAnalyticsData.skillChart)
  const [progressData] = useState<any[]>(mockAnalyticsData.progressChart)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  // Bar chart data - Assignment completion by difficulty
  const assignmentCompletionData = [
    { name: 'Easy', value: 12, color: '#10b981' },
    { name: 'Medium', value: 8, color: '#f59e0b' },
    { name: 'Hard', value: 3, color: '#ef4444' },
  ]

  // Pie chart data - XP distribution by category
  const xpDistributionData = [
    { name: 'Assignments', value: 250, color: '#06b6d4' },
    { name: 'Submissions', value: 150, color: '#ec4899' },
    { name: 'Achievements', value: 50, color: '#8b5cf6' },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-white font-orbitron mb-2">Detailed Analytics</h2>
        <p className="text-gray-400 text-sm">Comprehensive breakdown of your learning metrics</p>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: ANIMATION_DELAYS.staggerCard * 0 }}
        >
          <ActivityChart data={activityData} />
        </motion.div>

        {/* Skill Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: ANIMATION_DELAYS.staggerCard * 1 }}
        >
          <SkillChart data={skillData} />
        </motion.div>

        {/* Progress Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: ANIMATION_DELAYS.staggerCard * 2 }}
          className="lg:col-span-2"
        >
          <ProgressChart data={progressData} />
        </motion.div>

        {/* Assignment Completion Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: ANIMATION_DELAYS.staggerCard * 3 }}
        >
          <AnalyticsBarChart
            data={assignmentCompletionData}
            title="Assignment Completion"
            description="Completed assignments by difficulty level"
          />
        </motion.div>

        {/* XP Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: ANIMATION_DELAYS.staggerCard * 4 }}
        >
          <AnalyticsPieChart
            data={xpDistributionData}
            title="XP Distribution"
            description="XP earned by activity type"
          />
        </motion.div>
      </div>
    </div>
  )
}
