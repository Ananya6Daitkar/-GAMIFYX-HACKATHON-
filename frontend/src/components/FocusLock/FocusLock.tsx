import React, { useState } from 'react'
import { FocusLockMode } from './FocusLockMode'
import { User } from '../../types/index'
import { mockUser } from '../../utils/mockData'

export const FocusLock: React.FC = () => {
  const [user] = useState<User | null>(mockUser)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 border-r-2 border-magenta-500" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md">
        <div className="text-red-400 text-center">
          {error || 'Failed to load focus lock'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md">
      <FocusLockMode user={user} streakDays={5} />
    </div>
  )
}
