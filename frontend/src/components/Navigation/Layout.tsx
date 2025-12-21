import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SkipLink } from './SkipLink'
import { NotificationContainer } from '../Notifications'
import { User } from '../../types/index'
import { THEME } from '../../constants/theme'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface LayoutProps {
  children: React.ReactNode
  user?: User
}

interface NavLink {
  label: string
  href: string
  icon?: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'Assignments', href: '/assignments', icon: '📚' },
  { label: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
  { label: 'Achievements', href: '/achievements', icon: '⭐' },
  { label: 'Submissions', href: '/submissions', icon: '📝' },
  { label: 'Analytics', href: '/analytics', icon: '📈' },
  { label: 'Focus Lock', href: '/focus', icon: '🎯' },
  { label: 'Teacher Dashboard', href: '/teacher', icon: '👨‍🏫' },
  { label: 'Feedback', href: '/feedback', icon: '💬' },
  { label: 'DevOps', href: '/devops', icon: '🚀' },
  { label: 'AIOps', href: '/aiops', icon: '🤖' },
  { label: 'Notifications', href: '/notifications', icon: '🔔' },
  { label: 'Profile', href: '/profile', icon: '👤' },
]

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const mobile = width <= THEME.breakpoints.tablet
      setIsMobile(mobile)
      // Always keep sidebar closed by default (hamburger menu style)
      setIsSidebarOpen(false)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  // Handle keyboard navigation (Escape to close sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen && isMobile) {
        closeSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSidebarOpen, isMobile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Skip Link for keyboard navigation */}
      <SkipLink />

      {/* Header */}
      <Header
        user={user}
        onMenuToggle={toggleSidebar}
        isMobile={isMobile}
      />

      <div className="flex">
        {/* Sidebar - Always overlay, hidden by default */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: 'easeInOut' }
              }
              className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 z-40"
              role="navigation"
              aria-label="Main navigation"
            >
              <Sidebar
                links={NAV_LINKS}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay Backdrop */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.2 }
              }
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/50 z-30 top-16"
              role="presentation"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          id="main-content"
          className="flex-1"
          role="main"
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.3 }
            }
            className="w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Notification Container */}
      <NotificationContainer />
    </div>
  )
}
