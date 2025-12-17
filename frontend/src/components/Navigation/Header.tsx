import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User } from '../../types/index'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  user?: User
  onMenuToggle?: () => void
  isMobile?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onMenuToggle,
  isMobile = false,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    setShowUserMenu(false)
    navigate('/')
    window.location.reload()
  }

  // Handle keyboard navigation for user menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showUserMenu) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showUserMenu])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.3 }
      }
      className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-cyan-500/20 backdrop-blur-md"
      role="banner"
    >
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Left: Logo and Menu Toggle */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuToggle}
            className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>
          <h1 className="text-xl md:text-2xl font-bold text-cyan-400 font-orbitron">
            GamifyX
          </h1>
        </div>

        {/* Right: Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Bell */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 hover:bg-cyan-500/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Notifications"
          >
            <svg
              className="w-6 h-6 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-magenta-500 rounded-full" />
          </motion.button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-cyan-500/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="menu"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border border-cyan-400/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="hidden md:inline text-sm text-gray-300">
                {user?.username || 'User'}
              </span>
            </motion.button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.2 }
                }
                className="absolute right-0 mt-2 w-48 bg-slate-800 border border-cyan-500/20 rounded-lg shadow-lg backdrop-blur-md overflow-hidden"
                role="menu"
              >
                <div className="px-4 py-3 border-b border-cyan-500/10">
                  <p className="text-sm text-gray-300">{user?.email}</p>
                </div>
                <nav className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setShowUserMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors duration-200 focus:outline-none focus:bg-cyan-500/10 focus:text-cyan-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                    role="menuitem"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings')
                      setShowUserMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors duration-200 focus:outline-none focus:bg-cyan-500/10 focus:text-cyan-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                    role="menuitem"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 focus:outline-none focus:bg-red-500/10 focus:text-red-400 focus:ring-2 focus:ring-inset focus:ring-red-400"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </nav>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
