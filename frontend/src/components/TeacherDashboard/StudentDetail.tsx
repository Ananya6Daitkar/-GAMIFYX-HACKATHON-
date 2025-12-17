import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Submission } from '../../types'

interface StudentDetailData {
  student: {
    id: string
    username: string
    email: string
    level: number
    totalXp: number
    avatar?: string
    memberSince: Date
    githubUsername?: string
  }
  submissions: Submission[]
  analytics: {
    activityTimeline: any[]
    skillDistribution: Array<{ language: string; proficiency: number }>
  }
  githubRepos?: Array<{
    name: string
    url: string
    autoGradingScore: number
    lastSubmitted: Date
  }>
}

interface StudentDetailProps {
  studentId: string
  onBack: () => void
}

const mockStudentDetail: StudentDetailData = {
  student: {
    id: 'student1',
    username: 'AlexCoder',
    email: 'alex@example.com',
    level: 8,
    totalXp: 850,
    memberSince: new Date('2025-01-01'),
    githubUsername: 'alexcoder92',
  },
  submissions: [
    {
      id: 'sub1',
      studentId: 'student1',
      code: 'const hello = "world";',
      language: 'JavaScript',
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sub2',
      studentId: 'student1',
      code: 'function add(a, b) { return a + b; }',
      language: 'JavaScript',
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  analytics: {
    activityTimeline: [
      { date: 'Mon', submissions: 2 },
      { date: 'Tue', submissions: 3 },
      { date: 'Wed', submissions: 1 },
      { date: 'Thu', submissions: 4 },
      { date: 'Fri', submissions: 3 },
    ],
    skillDistribution: [
      { language: 'JavaScript', proficiency: 85 },
      { language: 'Python', proficiency: 72 },
      { language: 'TypeScript', proficiency: 78 },
    ],
  },
  githubRepos: [
    {
      name: 'assignment-1-rest-api',
      url: 'https://github.com/alexcoder92/assignment-1-rest-api',
      autoGradingScore: 92,
      lastSubmitted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'assignment-2-database',
      url: 'https://github.com/alexcoder92/assignment-2-database',
      autoGradingScore: 88,
      lastSubmitted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'assignment-3-frontend',
      url: 'https://github.com/alexcoder92/assignment-3-frontend',
      autoGradingScore: 95,
      lastSubmitted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ],
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ studentId, onBack }) => {
  const [detail] = useState<StudentDetailData>(mockStudentDetail)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

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

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-gray-400 hover:text-white transition-colors duration-300"
        >
          ← Back to Students
        </button>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-400">
          {error || 'Failed to load student details'}
        </div>
      </div>
    )
  }

  const { student, submissions, analytics } = detail

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-gray-400 hover:text-white transition-colors duration-300"
      >
        ← Back to Students
      </button>

      {/* Student Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-3xl font-bold text-cyan-400">
            {student.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2 font-orbitron">{student.username}</h2>
            <p className="text-gray-400 mb-4">{student.email}</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Level</p>
                <p className="text-2xl font-bold text-cyan-400">{student.level}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total XP</p>
                <p className="text-2xl font-bold text-magenta-400">{student.totalXp}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Member Since</p>
                <p className="text-sm font-medium text-blue-400">
                  {new Date(student.memberSince).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skill Distribution */}
      {analytics.skillDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 font-orbitron">Skill Distribution</h3>
          <div className="space-y-4">
            {analytics.skillDistribution.map((skill, index) => (
              <div key={skill.language}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{skill.language}</span>
                  <span className="text-cyan-400 text-sm">{skill.proficiency}%</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.proficiency}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* GitHub Repositories */}
      {detail.githubRepos && detail.githubRepos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🐙</span>
            <h3 className="text-xl font-bold text-white font-orbitron">GitHub Repositories</h3>
          </div>
          <div className="space-y-3">
            {detail.githubRepos.map((repo, index) => (
              <motion.div
                key={repo.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 bg-slate-700/30 border border-slate-600/50 rounded hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300"
                    >
                      {repo.name}
                    </a>
                    <p className="text-gray-400 text-sm mt-1">
                      Last submitted: {new Date(repo.lastSubmitted).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">{repo.autoGradingScore}</div>
                    <p className="text-xs text-gray-400">/100</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Submission History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 font-orbitron">Submission History</h3>
        
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission, index) => {
              const statusColor =
                submission.status === 'approved'
                  ? 'text-green-400 bg-green-500/10 border-green-500/30'
                  : submission.status === 'revision_needed'
                  ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                  : 'text-gray-400 bg-gray-500/10 border-gray-500/30'

              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{submission.language}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded border text-sm font-medium ${statusColor}`}>
                    {submission.status.replace('_', ' ').toUpperCase()}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
