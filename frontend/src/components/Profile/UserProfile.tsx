import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Badge } from '../../types/index'
import { mockUser, mockBadges } from '../../utils/mockData'
import { ProfileHeader } from './ProfileHeader'
import { StatsSection } from './StatsSection'
import { EditForm } from './EditForm'
import { ANIMATION_DELAYS } from '../../constants/theme'
import { api } from '../../utils/api'

interface UserProfileProps {
  userId?: string
  isOwnProfile?: boolean
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  isOwnProfile = true,
}) => {
  const [user, setUser] = useState<User | null>(mockUser)
  const [badges] = useState<Badge[]>(mockBadges)
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleProfileUpdate = async (updates: Partial<User>) => {
    try {
      setError(null)
      const updatedUser = await api.put('/users/me', updates)
      setUser(updatedUser)
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update profile'
      )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-400">
          {error || 'Failed to load profile'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 flex items-center gap-2"
        >
          <span>✓</span>
          {successMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-2"
        >
          <span>✕</span>
          {error}
        </motion.div>
      )}

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
        />
      </motion.div>

      {/* Edit Form or Stats */}
      {isEditing && isOwnProfile ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: ANIMATION_DELAYS.staggerCard * 1 }}
        >
          <EditForm
            user={user}
            onSave={handleProfileUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: ANIMATION_DELAYS.staggerCard * 1 }}
        >
          <StatsSection user={user} badges={badges} />
        </motion.div>
      )}
    </div>
  )
}
