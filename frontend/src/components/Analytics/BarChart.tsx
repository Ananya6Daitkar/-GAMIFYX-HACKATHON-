import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { THEME } from '../../constants/theme'

interface BarChartData {
  name: string
  value: number
  color?: string
}

interface AnalyticsBarChartProps {
  data: BarChartData[]
  title: string
  description?: string
}

export const AnalyticsBarChart: React.FC<AnalyticsBarChartProps> = ({
  data,
  title,
  description,
}) => {
  const [isAnimating, setIsAnimating] = useState(true)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-md">
          <p className="text-cyan-400 text-sm font-semibold">{data.name}</p>
          <p className="text-gray-300 text-sm">
            Value: <span className="text-cyan-400">{data.value}</span>
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
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-orbitron mb-2">
          {title}
        </h2>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>

      {data.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.colors.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={THEME.colors.primary} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.colors.primary + '20'} />
              <XAxis
                dataKey="name"
                stroke={THEME.colors.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke={THEME.colors.textSecondary} style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill="url(#colorBar)"
                isAnimationActive={isAnimating}
                animationDuration={1500}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-400">
          <p>No data available</p>
        </div>
      )}
    </motion.div>
  )
}
