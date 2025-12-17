import React from 'react'
import { motion } from 'framer-motion'
import { Profile } from '../components/Profile/Profile'

export const ProfilePage: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">My Profile</h1>
          <p className="text-gray-400">View and edit your profile information</p>
        </motion.div>

        <Profile />
      </div>
    </motion.div>
  )
}
