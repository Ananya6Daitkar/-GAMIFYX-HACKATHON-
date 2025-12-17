import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface FocusOverlayProps {
  sessionId: string
  streakDays?: number
  onExit: () => void
  onSessionEnd: (duration: number) => void
}

export const FocusOverlay: React.FC<FocusOverlayProps> = ({
  sessionId,
  streakDays = 0,
  onExit,
  onSessionEnd,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [xpMultiplier, setXpMultiplier] = useState(1)
  const [showExitWarning, setShowExitWarning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  // Calculate XP multiplier based on streak
  useEffect(() => {
    const multiplier = 1 + Math.min(streakDays * 0.1, 0.5)
    setXpMultiplier(multiplier)
  }, [streakDays])

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTimeRef.current) / 1000)
      setElapsedSeconds(elapsed)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Prevent fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowExitWarning(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Prevent tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowExitWarning(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to exit
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowExitWarning(true)
      }
      // Prevent Alt+Tab, Cmd+Tab
      if ((e.altKey && e.key === 'Tab') || (e.metaKey && e.key === 'Tab')) {
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const calculateXP = (): number => {
    const minutes = Math.ceil(elapsedSeconds / 60)
    let xp = minutes
    if (streakDays > 0) {
      xp = Math.floor(xp * xpMultiplier)
    }
    return Math.max(xp, 5)
  }

  const handleEndSession = () => {
    setShowExitWarning(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    onSessionEnd(elapsedSeconds)
  }

  const handleContinue = () => {
    setShowExitWarning(false)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex flex-col items-center justify-center z-50">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,255,.05)_25%,rgba(0,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(0,255,255,.05)_75%,rgba(0,255,255,.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-orbitron mb-8"
        >
          FOCUS LOCK MODE
        </motion.h1>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="text-7xl font-bold text-cyan-400 font-mono tracking-wider">
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-gray-400 mt-4 text-lg">
            Stay focused and earn XP
          </p>
        </motion.div>

        {/* XP Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-cyan-500/30 rounded-lg p-6 mb-12 backdrop-blur-md"
        >
          <p className="text-gray-400 text-sm mb-2">Current XP Reward</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-4xl font-bold text-cyan-400">
              {calculateXP()}
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">XP</p>
              {streakDays > 0 && (
                <p className="text-magenta-400 text-sm">
                  {(xpMultiplier * 100).toFixed(0)}% multiplier
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-sm space-y-2"
        >
          <p>💡 Press ESC to exit (session will be abandoned)</p>
          <p>🚫 Tab switching is blocked</p>
          <p>⏱️ Minimum 5 minutes for XP reward</p>
        </motion.div>
      </motion.div>

      {/* Exit Warning Dialog */}
      {showExitWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleContinue}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 rounded-lg p-8 max-w-md"
          >
            <h2 className="text-2xl font-bold text-white font-orbitron mb-4">
              ⚠️ Exit Focus Mode?
            </h2>

            <p className="text-gray-300 mb-6">
              You've earned <span className="text-cyan-400 font-bold">{calculateXP()} XP</span> so far.
            </p>

            <p className="text-gray-400 text-sm mb-8">
              If you exit now, your session will be abandoned and you won't receive the XP reward.
            </p>

            <div className="flex gap-4">
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
              >
                Continue Focus
              </motion.button>
              <motion.button
                onClick={handleEndSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
              >
                Exit & Abandon
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
