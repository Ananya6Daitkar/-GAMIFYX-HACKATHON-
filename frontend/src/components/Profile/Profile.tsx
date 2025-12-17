import React from 'react'
import { UserProfile } from './UserProfile'

export const Profile: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md">
      <UserProfile isOwnProfile={true} />
    </div>
  )
}
