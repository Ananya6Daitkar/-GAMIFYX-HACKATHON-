import React from 'react'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  username: string
  level: number
  avatar?: string
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  username,
  level,
  avatar,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group mb-8"
    >
      {/* Neon glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-magenta-500/20 to-blue-500/20 rounded-lg blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Main hero card */}
      <div className="relative bg-gradient-to-r from-slate-800/80 via-slate-900/80 to-slate-800/80 border border-cyan-500/30 rounded-lg p-8 backdrop-blur-md hover:border-cyan-500/60 transition-all duration-300">
        <div className="flex items-center gap-6">
          {avatar ? (
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              src={avatar}
              alt={username}
              className="w-24 h-24 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-500/50 object-cover"
            />
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-500/50 bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 flex items-center justify-center"
            >
              <span className="text-3xl">👤</span>
            </motion.div>
          )}
          
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold text-white font-orbitron"
            >
              Welcome, {username}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-4 mt-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-lg font-orbitron">Level</span>
                <span className="text-3xl font-bold text-cyan-400 font-orbitron">
                  {level}
                </span>
              </div>
              
              {/* Level indicator bar */}
              <div className="flex-1 max-w-xs">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden border border-cyan-500/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((level / 50) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500 shadow-lg shadow-cyan-500/50"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
