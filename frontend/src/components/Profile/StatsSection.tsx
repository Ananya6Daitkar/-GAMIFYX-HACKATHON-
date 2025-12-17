import React from 'react'
import { motion } from 'framer-motion'
import { User, Badge } from '../../types/index'
import { ANIMATION_DELAYS } from '../../constants/theme'

interface StatsSectionProps {
  user: User
  badges: Badge[]
}

export const StatsSection: React.FC<StatsSectionProps> = ({ user, badges }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: ANIMATION_DELAYS.staggerCard / 1000,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Main Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Total XP */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md hover:border-cyan-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-semibold">Total XP</h3>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-4xl font-bold text-cyan-400 font-orbitron">
            {user.totalXp.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            {Math.floor(user.totalXp / 100)} levels worth
          </p>
        </motion.div>

        {/* Current Level */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-magenta-500/20 rounded-lg p-6 backdrop-blur-md hover:border-magenta-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-semibold">Level</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-4xl font-bold text-magenta-400 font-orbitron">
            {user.level}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            {((user.totalXp % 100) / 100 * 100).toFixed(0)}% to next level
          </p>
        </motion.div>

        {/* Badges Earned */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-lg p-6 backdrop-blur-md hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-semibold">Badges</h3>
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-4xl font-bold text-blue-400 font-orbitron">
            {badges.length}
          </p>
          <p className="text-gray-500 text-xs mt-2">achievements unlocked</p>
        </motion.div>
      </motion.div>

      {/* Badges Grid */}
      {badges.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white font-orbitron mb-6">
            Earned Badges
          </h2>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="group relative"
              >
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-4 flex flex-col items-center justify-center aspect-square hover:border-cyan-500/50 transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 cursor-pointer"
                >
                  <span className="text-4xl mb-2">{badge.icon || '🏅'}</span>
                  <p className="text-xs text-center text-gray-300 font-semibold line-clamp-2">
                    {badge.name}
                  </p>
                </div>

                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 border border-cyan-500/50 rounded-lg p-3 w-48 text-xs text-gray-300 pointer-events-none z-10 hidden group-hover:block"
                >
                  <p className="font-semibold text-cyan-400 mb-1">
                    {badge.name}
                  </p>
                  <p>{badge.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Account Info */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-gray-500/20 rounded-lg p-6 backdrop-blur-md"
      >
        <h3 className="text-lg font-bold text-white font-orbitron mb-4">
          Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Username</span>
            <span className="text-white font-semibold">{user.username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Email</span>
            <span className="text-white font-semibold">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Role</span>
            <span className="text-white font-semibold capitalize">
              {user.role}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Member Since</span>
            <span className="text-white font-semibold">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
