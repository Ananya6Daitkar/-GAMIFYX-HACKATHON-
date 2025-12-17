import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FocusButtonProps {
  onActivate: () => void
  disabled?: boolean
}

export const FocusButton: React.FC<FocusButtonProps> = ({ onActivate, disabled = false }) => {
  const [showWarning, setShowWarning] = useState(false)

  const handleClick = () => {
    setShowWarning(true)
  }

  const handleConfirm = () => {
    setShowWarning(false)
    onActivate()
  }

  const handleCancel = () => {
    setShowWarning(false)
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Neon glow effect */}
        <div className="absolute inset-0 bg-cyan-500/20 blur-lg -z-10" />
        
        <span className="relative flex items-center gap-2">
          🎯 Focus Lock Mode
        </span>
      </motion.button>

      {/* Warning Dialog */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-lg p-8 max-w-md backdrop-blur-md"
            >
              <h2 className="text-2xl font-bold text-white font-orbitron mb-4">
                ⚠️ Focus Lock Mode
              </h2>
              
              <p className="text-gray-300 mb-6">
                You're about to enter Focus Lock Mode. This will:
              </p>
              
              <ul className="text-gray-300 space-y-2 mb-8 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <span>Enter fullscreen mode</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <span>Block tab switching and navigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <span>Award XP based on session duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <span>Apply streak bonus multiplier</span>
                </li>
              </ul>

              <p className="text-gray-400 text-sm mb-6">
                You can exit by pressing ESC, but you'll lose the session.
              </p>

              <div className="flex gap-4">
                <motion.button
                  onClick={handleCancel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleConfirm}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg"
                >
                  Enter Focus Mode
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
