import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClassOverview } from './ClassOverview'
import { StudentList } from './StudentList'
import { StudentDetail } from './StudentDetail'

type ViewMode = 'overview' | 'students' | 'student-detail'

export const TeacherDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId)
    setViewMode('student-detail')
  }

  const handleBackToStudents = () => {
    setViewMode('students')
    setSelectedStudentId(null)
  }

  const handleBackToOverview = () => {
    setViewMode('overview')
    setSelectedStudentId(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">Teacher Dashboard</h1>
        <p className="text-gray-400">Manage your class, track student progress, and review submissions</p>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-4 mb-8 flex-wrap"
      >
        <button
          onClick={handleBackToOverview}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
            viewMode === 'overview'
              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/70 text-cyan-400'
              : 'bg-slate-700/50 border border-slate-600/50 text-gray-400 hover:text-white'
          }`}
        >
          📊 Class Overview
        </button>
        <button
          onClick={() => setViewMode('students')}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
            viewMode === 'students' || viewMode === 'student-detail'
              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/70 text-cyan-400'
              : 'bg-slate-700/50 border border-slate-600/50 text-gray-400 hover:text-white'
          }`}
        >
          👥 Students
        </button>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ClassOverview />
          </motion.div>
        )}

        {viewMode === 'students' && (
          <motion.div
            key="students"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StudentList onSelectStudent={handleSelectStudent} />
          </motion.div>
        )}

        {viewMode === 'student-detail' && selectedStudentId && (
          <motion.div
            key="student-detail"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StudentDetail
              studentId={selectedStudentId}
              onBack={handleBackToStudents}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
