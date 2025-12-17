import React from 'react'
import { motion } from 'framer-motion'
import { SubmissionList } from '../components/Submissions/SubmissionList'

export const SubmissionsPage: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">My Submissions</h1>
          <p className="text-gray-400">View your code submissions and feedback from mentors</p>
        </motion.div>

        <SubmissionList />
      </div>
    </motion.div>
  )
}
