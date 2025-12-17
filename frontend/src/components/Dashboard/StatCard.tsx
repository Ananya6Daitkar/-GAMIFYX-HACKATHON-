import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  delay?: number
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  delay = 0,
}) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { delay: delay / 1000, duration: 0.5 }
      }
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      className="relative group"
    >
      {/* Neon glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
      
      {/* Main card */}
      <div
        className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-md hover:border-cyan-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 focus-within:border-cyan-400 focus-within:shadow-lg focus-within:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        role="region"
        aria-label={`${title}: ${value}`}
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-bold text-white mt-2 font-orbitron">
              {value}
            </p>
          </div>
          {icon && (
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : { y: [0, -5, 0] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 2, repeat: Infinity }
              }
              className="text-cyan-400 text-4xl drop-shadow-lg"
              aria-hidden="true"
            >
              {icon}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
