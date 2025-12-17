import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Assignment, StudentAssignment } from '../../types'
import { AssignmentCard } from './AssignmentCard'
import { AcceptAssignmentModal } from './AcceptAssignmentModal'

interface AssignmentListProps {
  assignments: StudentAssignment[]
  onAcceptAssignment?: (assignmentId: string, repoUrl: string, branch: string) => void
  onViewDetails?: (assignment: Assignment) => void
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  onAcceptAssignment,
  onViewDetails,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleAcceptClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setShowModal(true)
  }

  const handleModalSubmit = (repoUrl: string, branch: string) => {
    if (selectedAssignment && onAcceptAssignment) {
      onAcceptAssignment(selectedAssignment.id, repoUrl, branch)
    }
    setShowModal(false)
    setSelectedAssignment(null)
  }

  const handleViewDetails = (assignment: Assignment) => {
    onViewDetails?.(assignment)
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

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Assignments Available</h3>
        <p className="text-gray-400">Check back later for new assignments from your teacher.</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {assignments.map((studentAssignment) => (
          <motion.div key={studentAssignment.assignment.id} variants={itemVariants}>
            <AssignmentCard
              assignment={studentAssignment.assignment}
              isAccepted={studentAssignment.accepted}
              onAccept={() => handleAcceptClick(studentAssignment.assignment)}
              onViewDetails={() => handleViewDetails(studentAssignment.assignment)}
            />
          </motion.div>
        ))}
      </motion.div>

      {selectedAssignment && (
        <AcceptAssignmentModal
          isOpen={showModal}
          assignment={selectedAssignment}
          onClose={() => {
            setShowModal(false)
            setSelectedAssignment(null)
          }}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  )
}
