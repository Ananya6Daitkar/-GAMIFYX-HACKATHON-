import React from 'react'
import { motion } from 'framer-motion'
import { User } from '../../types/index'

interface ProfileHeaderProps {
  user: User
  isOwnProfile: boolean
  isEditing: boolean
  onEditToggle: () => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  isEditing,
  onEditToggle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-8 backdrop-blur-md mb-8"
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-1 shadow-lg shadow-cyan-500/50">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-4xl font-bold text-cyan-400">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Level Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute -bottom-2 -right-2 bg-gradient-to-br from-magenta-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg shadow-magenta-500/50 border-2 border-slate-900"
          >
            <div className="text-center">
              <div className="text-xs text-gray-200">Level</div>
              <div className="text-2xl font-bold text-white">{user.level}</div>
            </div>
          </motion.div>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          <h1 className="text-4xl font-bold text-white font-orbitron mb-2">
            {user.username}
          </h1>
          <p className="text-gray-400 mb-4">{user.email}</p>

          {/* Role Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-sm font-semibold">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <span className="text-gray-400 text-sm">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEditToggle}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isEditing
                  ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                  : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
