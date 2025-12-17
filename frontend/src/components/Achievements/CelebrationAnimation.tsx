import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

interface CelebrationAnimationProps {
  isVisible: boolean
  onComplete?: () => void
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  // Generate confetti particles
  const confetti = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 0.2,
    duration: 2 + Math.random() * 0.5,
    x: (Math.random() - 0.5) * 200,
    y: Math.random() * 300 + 100,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      {/* Center Badge Pop */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute text-6xl"
      >
        🎉
      </motion.div>

      {/* Confetti Particles */}
      {confetti.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: 0,
            rotate: particle.rotation,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeOut',
          }}
          className="absolute text-2xl"
        >
          {['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}

      {/* Radial Glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute w-20 h-20 bg-cyan-500 rounded-full blur-2xl"
      />
    </div>
  )
}
