import React, { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { ProgressData } from './Analytics'
import { THEME } from '../../constants/theme'

interface ProgressChartProps {
  data: ProgressData[]
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const [isAnimating, setIsAnimating] = useState(true)

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900 border border-blue-500/50 rounded-lg p-3 backdrop-blur-md">
          <p className="text-blue-400 text-sm font-semibold">{data.date}</p>
          <p className="text-gray-300 text-sm">
            Total XP: <span className="text-blue-400">{data.totalXP}</span>
          </p>
          <p className="text-gray-300 text-sm">
            Level: <span className="text-cyan-400">{data.level}</span>
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
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-lg p-6 backdrop-blur-md"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-orbitron mb-2">
          Progress Over Time
        </h2>
        <p className="text-gray-400 text-sm">XP growth and level progression</p>
      </div>

      {data.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.colors.accent} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={THEME.colors.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.colors.accent + '20'} />
              <XAxis
                dataKey="date"
                stroke={THEME.colors.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke={THEME.colors.textSecondary} style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalXP"
                stroke={THEME.colors.accent}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorXP)"
                isAnimationActive={isAnimating}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-400">
          <p>No progress data available</p>
        </div>
      )}
    </motion.div>
  )
}
