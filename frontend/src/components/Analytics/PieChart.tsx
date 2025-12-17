import React, { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'

interface PieChartData {
  name: string
  value: number
  color?: string
}

interface AnalyticsPieChartProps {
  data: PieChartData[]
  title: string
  description?: string
}

const COLORS = [
  '#06b6d4', // cyan
  '#ec4899', // magenta
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#6366f1', // indigo
]

export const AnalyticsPieChart: React.FC<AnalyticsPieChartProps> = ({
  data,
  title,
  description,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = data.value
      return (
        <div className="bg-slate-900 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-md">
          <p className="text-cyan-400 text-sm font-semibold">{data.name}</p>
          <p className="text-gray-300 text-sm">
            Value: <span className="text-cyan-400">{total}</span>
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
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-magenta-500/20 rounded-lg p-6 backdrop-blur-md w-full"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-orbitron mb-2">
          {title}
        </h2>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>

      {data && data.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: '100%', height: '320px' }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || COLORS[index % COLORS.length]}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
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
