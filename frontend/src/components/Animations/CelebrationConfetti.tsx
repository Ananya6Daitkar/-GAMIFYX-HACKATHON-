import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  rotation: number
}

interface CelebrationConfettiProps {
  trigger?: boolean
  onComplete?: () => void
}

export const CelebrationConfetti: React.FC<CelebrationConfettiProps> = ({
  trigger = true,
  onComplete,
}) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!trigger || prefersReducedMotion) {
      onComplete?.()
      return
    }

    // Generate confetti pieces
    const pieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random() * 1,
      rotation: Math.random() * 360,
    }))

    setConfetti(pieces)

    // Clear confetti after animation completes
    const timer = setTimeout(() => {
      setConfetti([])
      onComplete?.()
    }, 3500)

    return () => clearTimeout(timer)
  }, [trigger, onComplete, prefersReducedMotion])

  if (!confetti.length) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            opacity: 1,
            y: -10,
            x: `${piece.left}%`,
            rotate: 0,
          }}
          animate={{
            opacity: 0,
            y: window.innerHeight + 10,
            rotate: piece.rotation,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `hsl(${Math.random() * 360}, 100%, 50%)`,
          }}
        />
      ))}
    </div>
  )
}
