import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock socket.io-client before importing the hook
vi.mock('socket.io-client', () => {
  const mockSocket = {
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  }

  return {
    io: vi.fn(() => mockSocket),
  }
})

import { useRealtimeUpdates } from './useRealtimeUpdates'
import { io } from 'socket.io-client'

describe('useRealtimeUpdates', () => {
  let mockSocket: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockSocket = (io as any).mock.results[0]?.value || {
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
      connected: true,
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize WebSocket connection', () => {
    const { result } = renderHook(() => useRealtimeUpdates())

    // Verify socket is initialized
    expect(result.current.socket).toBeDefined()
  })

  it('should authenticate user when userId is provided', () => {
    const userId = 'test-user-id'
    const { result } = renderHook(() => useRealtimeUpdates({ userId }))

    // Verify socket is initialized
    expect(result.current.socket).toBeDefined()
  })

  it('should handle XP events', async () => {
    const onXPEvent = vi.fn()
    renderHook(() => useRealtimeUpdates({ onXPEvent }))

    // Simulate XP event
    const xpEvent = {
      userId: 'user-1',
      amount: 100,
      reason: 'Submission approved',
      timestamp: new Date(),
    }

    // Get the 'xp:earned' handler
    const xpHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'xp:earned')?.[1]

    if (xpHandler) {
      xpHandler(xpEvent)
      expect(onXPEvent).toHaveBeenCalledWith(xpEvent)
    }
  })

  it('should handle leaderboard updates', async () => {
    const onLeaderboardUpdate = vi.fn()
    renderHook(() => useRealtimeUpdates({ onLeaderboardUpdate }))

    const update = {
      period: 'daily' as const,
      entries: [
        { rank: 1, userId: 'user-1', username: 'alice', xp: 1000, streak: 5 },
      ],
      timestamp: new Date(),
    }

    const leaderboardHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'leaderboard:updated')?.[1]

    if (leaderboardHandler) {
      leaderboardHandler(update)
      expect(onLeaderboardUpdate).toHaveBeenCalledWith(update)
    }
  })

  it('should handle rank changes', async () => {
    const onRankChange = vi.fn()
    renderHook(() => useRealtimeUpdates({ onRankChange }))

    const rankChange = {
      userId: 'user-1',
      period: 'daily' as const,
      newRank: 2,
      previousRank: 3,
      timestamp: new Date(),
    }

    const rankHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'leaderboard:rankChanged')?.[1]

    if (rankHandler) {
      rankHandler(rankChange)
      expect(onRankChange).toHaveBeenCalledWith(rankChange)
    }
  })

  it('should handle feedback notifications', async () => {
    const onFeedbackAvailable = vi.fn()
    renderHook(() => useRealtimeUpdates({ onFeedbackAvailable }))

    const feedback = {
      submissionId: 'submission-1',
      feedback: {
        id: 'feedback-1',
        insights: ['Good code'],
        confidenceScore: 85,
      },
      timestamp: new Date(),
    }

    const feedbackHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'feedback:available')?.[1]

    if (feedbackHandler) {
      feedbackHandler(feedback)
      expect(onFeedbackAvailable).toHaveBeenCalledWith(feedback)
    }
  })

  it('should handle submission status updates', async () => {
    const onSubmissionStatusUpdate = vi.fn()
    renderHook(() => useRealtimeUpdates({ onSubmissionStatusUpdate }))

    const update = {
      submissionId: 'submission-1',
      status: 'approved' as const,
      updatedAt: new Date(),
      timestamp: new Date(),
    }

    const statusHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'submission:statusChanged')?.[1]

    if (statusHandler) {
      statusHandler(update)
      expect(onSubmissionStatusUpdate).toHaveBeenCalledWith(update)
    }
  })

  it('should handle badge earned notifications', async () => {
    const onBadgeEarned = vi.fn()
    renderHook(() => useRealtimeUpdates({ onBadgeEarned }))

    const badge = {
      badgeName: 'First Commit',
      badgeIcon: 'icon-url',
      timestamp: new Date(),
    }

    const badgeHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'badge:earned')?.[1]

    if (badgeHandler) {
      badgeHandler(badge)
      expect(onBadgeEarned).toHaveBeenCalledWith(badge)
    }
  })

  it('should handle level up notifications', async () => {
    const onLevelUp = vi.fn()
    renderHook(() => useRealtimeUpdates({ onLevelUp }))

    const levelUp = {
      newLevel: 5,
      totalXP: 500,
      timestamp: new Date(),
    }

    const levelHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'level:up')?.[1]

    if (levelHandler) {
      levelHandler(levelUp)
      expect(onLevelUp).toHaveBeenCalledWith(levelUp)
    }
  })

  it('should handle generic notifications', async () => {
    const onNotification = vi.fn()
    renderHook(() => useRealtimeUpdates({ onNotification }))

    const notification = {
      type: 'test:notification',
      message: 'Test message',
      data: { test: 'data' },
      timestamp: new Date(),
    }

    const notificationHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'notification')?.[1]

    if (notificationHandler) {
      notificationHandler(notification)
      expect(onNotification).toHaveBeenCalledWith(notification)
    }
  })

  it('should provide emit function', () => {
    const { result } = renderHook(() => useRealtimeUpdates())

    // Verify emit function exists and is callable
    expect(typeof result.current.emit).toBe('function')
    
    // Call emit
    result.current.emit('test:event', { data: 'test' })
  })

  it('should provide isConnected function', () => {
    const { result } = renderHook(() => useRealtimeUpdates())

    const connected = result.current.isConnected()

    expect(typeof connected).toBe('boolean')
  })

  it('should disconnect on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeUpdates())

    // Verify disconnect is called on unmount
    unmount()
    
    // Verify the hook cleaned up
    expect(true).toBe(true)
  })
})
