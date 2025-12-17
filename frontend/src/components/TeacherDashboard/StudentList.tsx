import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface StudentListItem {
  id: string
  username: string
  email: string
  level: number
  totalXp: number
  avatar?: string
  progressPercentage: number
  needsIntervention: boolean
  interventionReason?: string
}

interface StudentListProps {
  onSelectStudent: (studentId: string) => void
}

const mockStudents: StudentListItem[] = [
  {
    id: 'student1',
    username: 'AlexCoder',
    email: 'alex@example.com',
    level: 8,
    totalXp: 850,
    progressPercentage: 85,
    needsIntervention: false,
  },
  {
    id: 'student2',
    username: 'DevMaster',
    email: 'dev@example.com',
    level: 7,
    totalXp: 720,
    progressPercentage: 72,
    needsIntervention: false,
  },
  {
    id: 'student3',
    username: 'CodeNinja',
    email: 'ninja@example.com',
    level: 6,
    totalXp: 650,
    progressPercentage: 65,
    needsIntervention: false,
  },
  {
    id: 'student4',
    username: 'WebWizard',
    email: 'web@example.com',
    level: 5,
    totalXp: 580,
    progressPercentage: 58,
    needsIntervention: true,
    interventionReason: 'Low submission rate',
  },
  {
    id: 'student5',
    username: 'DataDriven',
    email: 'data@example.com',
    level: 5,
    totalXp: 520,
    progressPercentage: 52,
    needsIntervention: true,
    interventionReason: 'Needs help with assignments',
  },
  {
    id: 'student6',
    username: 'CloudKing',
    email: 'cloud@example.com',
    level: 4,
    totalXp: 480,
    progressPercentage: 48,
    needsIntervention: false,
  },
]

export const StudentList: React.FC<StudentListProps> = ({ onSelectStudent }) => {
  const [students] = useState<StudentListItem[]>(mockStudents)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = students.filter((student) =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/70 transition-all duration-300"
        />
        <span className="absolute right-4 top-3 text-gray-400">🔍</span>
      </div>

      {/* Students Table */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-slate-700/20 transition-colors duration-300"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-white font-bold">
                        {student.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{student.username}</p>
                        <p className="text-gray-400 text-sm">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-cyan-400 font-bold">{student.level}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-magenta-400 font-bold">{student.totalXp}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${student.progressPercentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        />
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{student.progressPercentage}%</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.needsIntervention ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 text-sm font-medium">Intervention</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-400 text-sm font-medium">On Track</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSelectStudent(student.id)}
                      className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 hover:border-cyan-500/70 transition-all duration-300"
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-400">No students found matching your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
