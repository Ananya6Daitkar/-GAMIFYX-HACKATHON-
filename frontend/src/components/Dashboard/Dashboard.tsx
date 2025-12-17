import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HeroSection } from './HeroSection'
import { StatCard } from './StatCard'
import { Spinner } from '../Loading'
import { User } from '../../types/index'
import { api } from '../../utils/api'
import { ANIMATION_DELAYS } from '../../constants/theme'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface DashboardProps {
  user?: User
}

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser }) => {
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [loading, setLoading] = useState(!initialUser)
  const [error, setError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [badgesCount, setBadgesCount] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    // If user data is already provided, don't fetch again
    if (initialUser) {
      console.log('Dashboard: Using provided user data:', initialUser)
      setUser(initialUser)
      setLoading(false)
      return
    }

    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user profile
        console.log('Dashboard: Fetching user data...')
        const userData = await api.get('/users/me')
        console.log('Dashboard: User data received:', userData)
        setUser(userData)

        // Fetch badges count
        try {
          console.log('Dashboard: Fetching badges...')
          const badgesData = await api.get('/gamification/badges/earned')
          console.log('Dashboard: Badges data:', badgesData)
          setBadgesCount(Array.isArray(badgesData) ? badgesData.length : 0)
        } catch (badgeErr) {
          console.warn('Dashboard: Failed to fetch badges:', badgeErr)
          setBadgesCount(0)
        }

        // Fetch streak
        try {
          console.log('Dashboard: Fetching streak...')
          const streakData = await api.get('/users/me/streak')
          console.log('Dashboard: Streak data:', streakData)
          setStreak(streakData?.streak || 0)
        } catch (streakErr) {
          console.warn('Dashboard: Failed to fetch streak:', streakErr)
          setStreak(0)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard'
        setError(errorMsg)
        console.error('Dashboard: Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [initialUser])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-400">
          {error || 'Failed to load user data'}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-6 py-8" role="main">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <HeroSection
          username={user.username}
          level={user.level}
          avatar={user.avatar}
        />

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.6, delay: 0.2 }
          }
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8"
          role="region"
          aria-label="Dashboard statistics"
        >
          <StatCard
            title="Experience Points"
            value={user.totalXp}
            icon="⭐"
            delay={ANIMATION_DELAYS.staggerCard * 0}
          />
          <StatCard
            title="Level"
            value={user.level}
            icon="🎯"
            delay={ANIMATION_DELAYS.staggerCard * 1}
          />
          <StatCard
            title="Badges Earned"
            value={badgesCount}
            icon="🏆"
            delay={ANIMATION_DELAYS.staggerCard * 2}
          />
          <StatCard
            title="Current Streak"
            value={streak}
            icon="🔥"
            delay={ANIMATION_DELAYS.staggerCard * 3}
          />
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.6, delay: 0.6 }
          }
          className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md"
        >
          <h2 className="text-2xl font-bold text-white font-orbitron mb-6">
            Quick Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Total XP</span>
              <span className="text-2xl font-bold text-cyan-400 mt-2">
                {user.totalXp}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Current Level</span>
              <span className="text-2xl font-bold text-magenta-400 mt-2">
                {user.level}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Member Since</span>
              <span className="text-2xl font-bold text-blue-400 mt-2">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
