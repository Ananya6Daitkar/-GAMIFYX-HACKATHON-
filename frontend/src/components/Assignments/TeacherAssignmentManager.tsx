import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Assignment, AssignmentSubmission, User } from '../../types'
import { CreateAssignmentModal } from './CreateAssignmentModal'
import { StudentSubmissionsView } from './StudentSubmissionsView'

interface TeacherAssignmentManagerProps {
  assignments: Assignment[]
  submissions: Record<string, AssignmentSubmission[]>
  students: User[]
  onCreateAssignment?: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateAssignment?: (id: string, assignment: Partial<Assignment>) => void
  onDeleteAssignment?: (id: string) => void
  onReviewSubmission?: (submissionId: string, status: string, feedback?: string) => void
}

export const TeacherAssignmentManager: React.FC<TeacherAssignmentManagerProps> = ({
  assignments,
  submissions,
  students,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onReviewSubmission,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'submissions'>('list')

  const handleCreateAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    onCreateAssignment?.(assignment)
    setShowCreateModal(false)
  }

  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setViewMode('submissions')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedAssignment(null)
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <>
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Assignment Manager</h2>
              <p className="text-gray-400 text-sm mt-1">
                Create and manage assignments for your class
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-magenta-500/20 to-pink-500/20 border border-magenta-500/50 rounded-lg text-magenta-400 font-medium hover:from-magenta-500/30 hover:to-pink-500/30 hover:border-magenta-500/70 transition-all duration-300 flex items-center gap-2"
            >
              <span>+</span>
              Create Assignment
            </button>
          </div>

          {/* Assignments list */}
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/10 rounded-lg">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Assignments Yet</h3>
              <p className="text-gray-400 mb-6">Create your first assignment to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-500/70 transition-all duration-300"
              >
                Create First Assignment
              </button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {assignments.map((assignment) => {
                const assignmentSubmissions = submissions[assignment.id] || []
                const passCount = assignmentSubmissions.filter((s) => s.status === 'PASS').length
                const reviewCount = assignmentSubmissions.filter((s) => s.status === 'REVIEW').length
                const failCount = assignmentSubmissions.filter((s) => s.status === 'FAIL').length

                return (
                  <motion.div
                    key={assignment.id}
                    variants={itemVariants}
                    className="relative group"
                  >
                    {/* Neon glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Card */}
                    <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {assignment.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {assignment.description}
                          </p>
                        </div>
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() => handleViewSubmissions(assignment)}
                            className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 hover:border-cyan-500/70 transition-all duration-300"
                          >
                            View Submissions
                          </button>
                          <button
                            onClick={() => onDeleteAssignment?.(assignment.id)}
                            className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm font-medium hover:bg-red-500/30 hover:border-red-500/70 transition-all duration-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-700/30 border border-slate-600/50 rounded">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Difficulty
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {assignment.difficulty}
                          </div>
                        </div>
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Pass
                          </div>
                          <div className="text-sm font-semibold text-green-400">
                            {passCount}
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Review
                          </div>
                          <div className="text-sm font-semibold text-yellow-400">
                            {reviewCount}
                          </div>
                        </div>
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Fail
                          </div>
                          <div className="text-sm font-semibold text-red-400">
                            {failCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      ) : (
        <StudentSubmissionsView
          assignment={selectedAssignment!}
          submissions={submissions[selectedAssignment!.id] || []}
          students={students}
          onBack={handleBackToList}
          onReviewSubmission={onReviewSubmission}
        />
      )}

      {/* Create assignment modal */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAssignment}
      />
    </>
  )
}
