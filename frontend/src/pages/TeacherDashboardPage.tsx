import React from 'react'
import { motion } from 'framer-motion'
import { TeacherDashboard } from '../components/TeacherDashboard/TeacherDashboard'

export const TeacherDashboardPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 md:px-6 py-8"
    >
      <TeacherDashboard />
    </motion.div>
  )
}
