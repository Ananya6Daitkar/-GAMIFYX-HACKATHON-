import React from 'react'
import { motion } from 'framer-motion'
import { FocusLock } from '../components/FocusLock/FocusLock'

export const FocusLockPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 md:px-6 py-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Focus Lock</h1>
          <p className="text-gray-400">Eliminate distractions and earn bonus XP while focusing</p>
        </motion.div>

        <FocusLock />
      </div>
    </motion.div>
  )
}
