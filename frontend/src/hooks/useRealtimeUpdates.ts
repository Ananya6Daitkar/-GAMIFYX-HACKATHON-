import { useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface XPEvent {
  userId: string
  amount: number
  reason: string
  timestamp: Date
}

interface LeaderboardUpdate {
  period: 'daily' | 'weekly' | 'monthly'
  entries: any[]
  timestamp: Date
}

interface RankChange {
  userId: string
  period: 'daily' | 'weekly' | 'monthly'
  newRank: number
  previousRank?: number
  timestamp: Date
}

interface FeedbackNotification {
  submissionId: string
  feedback: any
  timestamp: Date
}

interface SubmissionStatusUpdate {
  submissionId: string
  status: 'pending' | 'approved' | 'revision_needed'
  updatedAt: Date
  timestamp: Date
}

interface BadgeEarned {
  badgeName: string
  badgeIcon: string
  timestamp: Date
}

interface LevelUp {
  newLevel: number
  totalXP: number
  timestamp: Date
}

interface Notification {
  type: string
  message: string
  data?: any
  timestamp: Date
}

interface UseRealtimeUpdatesOptions {
  userId?: string
  onXPEvent?: (event: XPEvent) => void
  onLeaderboardUpdate?: (update: LeaderboardUpdate) => void
  onRankChange?: (change: RankChange) => void
  onFeedbackAvailable?: (notification: FeedbackNotification) => void
  onSubmissionStatusUpdate?: (update: SubmissionStatusUpdate) => void
  onBadgeEarned?: (badge: BadgeEarned) => void
  onLevelUp?: (levelUp: LevelUp) => void
  onNotification?: (notification: Notification) => void
}

/**
 * Hook to manage real-time WebSocket updates
 * Requirement 16.1, 16.2, 16.3, 16.4, 16.5
 * Properties: 1, 2, 3, 4, 5, 7, 10
 */
export const useRealtimeUpdates = (options: UseRealtimeUpdatesOptions = {}) => {
  const socketRef = useRef<Socket | null>(null)
  const {
    userId,
    onXPEvent,
    onLeaderboardUpdate,
    onRankChange,
    onFeedbackAvailable,
    onSubmissionStatusUpdate,
    onBadgeEarned,
    onLevelUp,
    onNotification,
  } = options

  // Initialize WebSocket connection
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001'
    
    // Create socket connection
    const socket = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // Handle connection
    socket.on('connect', () => {
      console.log('[useRealtimeUpdates] Connected to WebSocket server')

      // Authenticate user if userId is provided
      if (userId) {
        socket.emit('authenticate', userId)
      }
    })

    // Handle XP events
    // Property 1: XP Accumulation Consistency
    socket.on('xp:earned', (event: XPEvent) => {
      console.log('[useRealtimeUpdates] XP event received:', event)
      onXPEvent?.(event)
    })

    // Handle leaderboard updates
    // Property 2: Leaderboard Ranking Accuracy
    socket.on('leaderboard:updated', (update: LeaderboardUpdate) => {
      console.log('[useRealtimeUpdates] Leaderboard update received:', update)
      onLeaderboardUpdate?.(update)
    })

    // Handle rank changes
    socket.on('leaderboard:rankChanged', (change: RankChange) => {
      console.log('[useRealtimeUpdates] Rank change received:', change)
      onRankChange?.(change)
    })

    // Handle feedback notifications
    // Property 5: AI Feedback Confidence Validity
    socket.on('feedback:available', (notification: FeedbackNotification) => {
      console.log('[useRealtimeUpdates] Feedback notification received:', notification)
      onFeedbackAvailable?.(notification)
    })

    // Handle submission status updates
    // Property 4: Submission Status Transitions
    socket.on('submission:statusChanged', (update: SubmissionStatusUpdate) => {
      console.log('[useRealtimeUpdates] Submission status update received:', update)
      onSubmissionStatusUpdate?.(update)
    })

    // Handle submission status updates for specific user
    socket.on('submission:statusUpdated', (update: SubmissionStatusUpdate) => {
      console.log('[useRealtimeUpdates] Submission status updated:', update)
      onSubmissionStatusUpdate?.(update)
    })

    // Handle badge earned notifications
    // Property 3: Badge Earning Idempotence
    socket.on('badge:earned', (badge: BadgeEarned) => {
      console.log('[useRealtimeUpdates] Badge earned:', badge)
      onBadgeEarned?.(badge)
    })

    // Handle level up notifications
    socket.on('level:up', (levelUp: LevelUp) => {
      console.log('[useRealtimeUpdates] Level up:', levelUp)
      onLevelUp?.(levelUp)
    })

    // Handle generic notifications
    // Property 7: Feedback Routing Correctness
    socket.on('notification', (notification: Notification) => {
      console.log('[useRealtimeUpdates] Notification received:', notification)
      onNotification?.(notification)
    })

    // Handle connection errors
    socket.on('error', (error: any) => {
      console.error('[useRealtimeUpdates] Socket error:', error)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('[useRealtimeUpdates] Disconnected from WebSocket server')
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId, onXPEvent, onLeaderboardUpdate, onRankChange, onFeedbackAvailable, onSubmissionStatusUpdate, onBadgeEarned, onLevelUp, onNotification])

  // Function to manually emit events (if needed)
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }, [])

  // Function to check connection status
  const isConnected = useCallback(() => {
    return socketRef.current?.connected ?? false
  }, [])

  return {
    socket: socketRef.current,
    emit,
    isConnected,
  }
}
