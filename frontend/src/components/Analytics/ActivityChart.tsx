import React, { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { ActivityData } from './Analytics'
import { THEME } from '../../constants/theme'

interface ActivityChartProps {
  data: ActivityData[]
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const [isAnimating, setIsAnimating] = useState(true)

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-md">
          <p className="text-cyan-400 text-sm font-semibold">{data.date}</p>
          <p className="text-gray-300 text-sm">
            Submissions: <span className="text-cyan-400">{data.submissionCount}</span>
          </p>
          <p className="text-gray-300 text-sm">
            XP Earned: <span className="text-magenta-400">{data.xpEarned}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md w-full"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-orbitron mb-2">
          Activity Timeline
        </h2>
        <p className="text-gray-400 text-sm">Submissions per day (30-day history)</p>
      </div>

      {data && data.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onAnimationComplete={() => setIsAnimating(false)}
          style={{ width: '100%', height: '320px' }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.colors.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={THEME.colors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.colors.primary + '20'} />
              <XAxis
                dataKey="date"
                stroke={THEME.colors.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke={THEME.colors.textSecondary} style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="submissionCount"
                stroke={THEME.colors.primary}
                strokeWidth={2}
                dot={{ fill: THEME.colors.primary, r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={isAnimating}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-400">
          <p>No activity data available</p>
        </div>
      )}
    </motion.div>
  )
}
