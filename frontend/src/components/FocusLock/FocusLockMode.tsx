import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { User } from '../../types/index'

interface FocusLockModeProps {
  user: User
  streakDays: number
}

export const FocusLockMode: React.FC<FocusLockModeProps> = ({ user, streakDays }) => {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedDuration, setSelectedDuration] = useState(25)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      // Session completed
      setSessionsCompleted(prev => prev + 1)
      setIsActive(false)
      setTimeLeft(selectedDuration * 60)
      
      // Play sound if enabled
      if (soundEnabled) {
        playCompletionSound()
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, soundEnabled, selectedDuration])

  const playCompletionSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsActive(true)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setTimeLeft(selectedDuration * 60)
  }

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration)
    setTimeLeft(duration * 60)
    setIsActive(false)
  }

  const xpReward = sessionsCompleted * 10

  return (
    <div className="space-y-8">
      {/* Main Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 sm:p-8 md:p-12 backdrop-blur-md text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-8 font-orbitron">Focus Lock Mode</h2>

        {/* Timer Display */}
        <motion.div
          animate={{
            scale: isActive ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isActive ? Infinity : 0,
          }}
          className="mb-8"
        >
          <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-cyan-400 font-mono mb-4">
            {formatTime(timeLeft)}
          </div>
          <p className="text-gray-400 text-base sm:text-lg">
            {isActive ? 'Focus in progress...' : 'Ready to focus?'}
          </p>
        </motion.div>

        {/* Duration Selector */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
          {[5, 15, 25, 45, 60].map(duration => (
            <button
              key={duration}
              onClick={() => handleDurationChange(duration)}
              disabled={isActive}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-all duration-300 ${
                selectedDuration === duration
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/50'
                  : 'bg-slate-700/50 text-gray-400 hover:text-white border border-slate-600/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {duration}m
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8 flex-wrap">
          {!isActive ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Start Focus</span>
              <span className="sm:hidden">Start</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Pause className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Pause</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-slate-700/50 border border-slate-600/50 text-gray-400 hover:text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <RotateCcw className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="hidden sm:inline">Reset</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-300 ${
              soundEnabled
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                : 'bg-slate-700/50 border border-slate-600/50 text-gray-400'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 sm:w-5 h-4 sm:h-5" />
            ) : (
              <VolumeX className="w-4 sm:w-5 h-4 sm:h-5" />
            )}
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Sessions</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">{sessionsCompleted}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">XP Earned</p>
            <p className="text-xl sm:text-2xl font-bold text-magenta-400">{xpReward}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Streak</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">{streakDays}🔥</p>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md"
      >
        <h3 className="text-lg font-bold text-white mb-4 font-orbitron">Focus Tips</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 font-bold">✓</span>
            <span className="text-gray-300">Eliminate distractions - close unnecessary tabs and apps</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 font-bold">✓</span>
            <span className="text-gray-300">Use the Pomodoro technique - 25 minutes focus, 5 minutes break</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 font-bold">✓</span>
            <span className="text-gray-300">Stay hydrated and take care of yourself</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 font-bold">✓</span>
            <span className="text-gray-300">Earn bonus XP for completing focus sessions</span>
          </li>
        </ul>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-magenta-500/20 rounded-lg p-6 backdrop-blur-md"
      >
        <h3 className="text-lg font-bold text-white mb-4 font-orbitron">Focus Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          <div className={`p-3 sm:p-4 rounded-lg border text-center ${sessionsCompleted >= 1 ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <p className="text-xl sm:text-2xl mb-2">🎯</p>
            <p className="text-xs sm:text-sm text-gray-300">First Focus</p>
            <p className="text-xs text-gray-400 mt-1">{sessionsCompleted >= 1 ? '✓' : '🔒'}</p>
          </div>
          <div className={`p-3 sm:p-4 rounded-lg border text-center ${sessionsCompleted >= 5 ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <p className="text-xl sm:text-2xl mb-2">🔥</p>
            <p className="text-xs sm:text-sm text-gray-300">5 Sessions</p>
            <p className="text-xs text-gray-400 mt-1">{sessionsCompleted >= 5 ? '✓' : '🔒'}</p>
          </div>
          <div className={`p-3 sm:p-4 rounded-lg border text-center ${sessionsCompleted >= 10 ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <p className="text-xl sm:text-2xl mb-2">⚡</p>
            <p className="text-xs sm:text-sm text-gray-300">10 Sessions</p>
            <p className="text-xs text-gray-400 mt-1">{sessionsCompleted >= 10 ? '✓' : '🔒'}</p>
          </div>
          <div className={`p-3 sm:p-4 rounded-lg border text-center ${sessionsCompleted >= 20 ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <p className="text-xl sm:text-2xl mb-2">👑</p>
            <p className="text-xs sm:text-sm text-gray-300">Focus Master</p>
            <p className="text-xs text-gray-400 mt-1">{sessionsCompleted >= 20 ? '✓' : '🔒'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
