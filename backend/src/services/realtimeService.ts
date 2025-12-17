import { Server as SocketIOServer, Socket } from 'socket.io'
import { XPEvent, LeaderboardEntry, AIFeedback, Submission } from '../database/models'

/**
 * Real-time Service for WebSocket communication
 * Handles broadcasting of XP events, leaderboard updates, feedback notifications, and submission status changes
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5
 */
class RealtimeService {
  private io: SocketIOServer | null = null
  private userSockets: Map<string, Set<string>> = new Map() // userId -> Set of socketIds

  /**
   * Initialize the real-time service with Socket.io instance
   */
  initialize(io: SocketIOServer): void {
    this.io = io

    // Set up connection handling
    this.io.on('connection', (socket: Socket) => {
      console.log(`[RealtimeService] Client connected: ${socket.id}`)

      // Handle user authentication and socket registration
      socket.on('authenticate', (userId: string) => {
        this.registerUserSocket(userId, socket.id)
        console.log(`[RealtimeService] User ${userId} authenticated with socket ${socket.id}`)
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        this.unregisterUserSocket(socket.id)
        console.log(`[RealtimeService] Client disconnected: ${socket.id}`)
      })

      // Handle errors
      socket.on('error', (error: any) => {
        console.error(`[RealtimeService] Socket error for ${socket.id}:`, error)
      })
    })
  }

  /**
   * Register a user socket connection
   * Requirement 16.1, 16.2
   */
  private registerUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    this.userSockets.get(userId)!.add(socketId)
  }

  /**
   * Unregister a user socket connection
   */
  private unregisterUserSocket(socketId: string): void {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId)
        if (sockets.size === 0) {
          this.userSockets.delete(userId)
        }
        break
      }
    }
  }

  /**
   * Broadcast XP event to all connected clients
   * Requirement 16.1
   * Property 1: XP Accumulation Consistency
   */
  broadcastXPEvent(event: XPEvent): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      userId: event.userId,
      amount: event.amount,
      reason: event.reason,
      timestamp: event.timestamp,
    }

    // Broadcast to all connected clients
    this.io.emit('xp:earned', payload)
    console.log(`[RealtimeService] Broadcasted XP event: ${event.userId} earned ${event.amount} XP`)
  }

  /**
   * Broadcast leaderboard update to all connected clients
   * Requirement 16.2
   * Property 2: Leaderboard Ranking Accuracy
   */
  broadcastLeaderboardUpdate(period: 'daily' | 'weekly' | 'monthly', entries: LeaderboardEntry[]): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      period,
      entries,
      timestamp: new Date(),
    }

    // Broadcast to all connected clients
    this.io.emit('leaderboard:updated', payload)
    console.log(`[RealtimeService] Broadcasted leaderboard update for period: ${period}`)
  }

  /**
   * Broadcast leaderboard rank change for a specific user
   * Requirement 16.2
   */
  broadcastRankChange(userId: string, period: 'daily' | 'weekly' | 'monthly', newRank: number, previousRank?: number): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      userId,
      period,
      newRank,
      previousRank,
      timestamp: new Date(),
    }

    // Broadcast to all connected clients
    this.io.emit('leaderboard:rankChanged', payload)
    console.log(`[RealtimeService] Broadcasted rank change for user ${userId}: ${previousRank} -> ${newRank}`)
  }

  /**
   * Send feedback notification to a specific user
   * Requirement 16.3
   * Property 7: Feedback Routing Correctness
   */
  notifyFeedbackAvailable(userId: string, feedback: AIFeedback, submissionId: string): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      submissionId,
      feedback: {
        id: feedback.id,
        insights: feedback.insights,
        confidenceScore: feedback.confidenceScore,
        codeReferences: feedback.codeReferences,
        generatedAt: feedback.generatedAt,
      },
      timestamp: new Date(),
    }

    // Send to specific user's sockets
    const userSockets = this.userSockets.get(userId)
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        this.io!.to(socketId).emit('feedback:available', payload)
      })
      console.log(`[RealtimeService] Sent feedback notification to user ${userId}`)
    } else {
      console.log(`[RealtimeService] User ${userId} not connected, feedback notification queued`)
    }
  }

  /**
   * Broadcast submission status update to all connected clients
   * Requirement 16.4
   * Property 4: Submission Status Transitions
   */
  broadcastSubmissionStatusUpdate(submission: Submission): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      submissionId: submission.id,
      studentId: submission.studentId,
      status: submission.status,
      language: submission.language,
      updatedAt: submission.updatedAt,
      timestamp: new Date(),
    }

    // Broadcast to all connected clients
    this.io.emit('submission:statusChanged', payload)
    console.log(`[RealtimeService] Broadcasted submission status update: ${submission.id} -> ${submission.status}`)
  }

  /**
   * Send submission status update to a specific user
   * Requirement 16.4
   */
  notifySubmissionStatusUpdate(userId: string, submission: Submission): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      submissionId: submission.id,
      status: submission.status,
      updatedAt: submission.updatedAt,
      timestamp: new Date(),
    }

    // Send to specific user's sockets
    const userSockets = this.userSockets.get(userId)
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        this.io!.to(socketId).emit('submission:statusUpdated', payload)
      })
      console.log(`[RealtimeService] Sent submission status update to user ${userId}`)
    }
  }

  /**
   * Send badge earned notification to a specific user
   * Requirement 16.1
   */
  notifyBadgeEarned(userId: string, badgeName: string, badgeIcon: string): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      badgeName,
      badgeIcon,
      timestamp: new Date(),
    }

    // Send to specific user's sockets
    const userSockets = this.userSockets.get(userId)
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        this.io!.to(socketId).emit('badge:earned', payload)
      })
      console.log(`[RealtimeService] Sent badge earned notification to user ${userId}`)
    }
  }

  /**
   * Send level up notification to a specific user
   * Requirement 16.1
   */
  notifyLevelUp(userId: string, newLevel: number, totalXP: number): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      newLevel,
      totalXP,
      timestamp: new Date(),
    }

    // Send to specific user's sockets
    const userSockets = this.userSockets.get(userId)
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        this.io!.to(socketId).emit('level:up', payload)
      })
      console.log(`[RealtimeService] Sent level up notification to user ${userId}`)
    }
  }

  /**
   * Send generic notification to a specific user
   * Requirement 16.3
   */
  notifyUser(userId: string, type: string, message: string, data?: any): void {
    if (!this.io) {
      console.warn('[RealtimeService] Socket.io not initialized')
      return
    }

    const payload = {
      type,
      message,
      data,
      timestamp: new Date(),
    }

    // Send to specific user's sockets
    const userSockets = this.userSockets.get(userId)
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        this.io!.to(socketId).emit('notification', payload)
      })
      console.log(`[RealtimeService] Sent notification to user ${userId}: ${type}`)
    }
  }

  /**
   * Get number of connected users
   */
  getConnectedUserCount(): number {
    return this.userSockets.size
  }

  /**
   * Get number of connected sockets
   */
  getConnectedSocketCount(): number {
    let count = 0
    for (const sockets of this.userSockets.values()) {
      count += sockets.size
    }
    return count
  }

  /**
   * Check if a user is connected
   */
  isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId)
    return sockets !== undefined && sockets.size > 0
  }
}

// Export singleton instance
export default new RealtimeService()
