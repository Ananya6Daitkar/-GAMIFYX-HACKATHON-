import express, { Router, Request, Response } from 'express'
import userRepository from '../database/repositories/userRepository'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Get current user profile
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).userId
    const user = await userRepository.findById(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching current user:', error)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// Get current user streak
router.get('/me/streak', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).userId
    // TODO: Implement streak calculation logic
    res.json({ streak: 0 })
  } catch (error) {
    console.error('Error fetching streak:', error)
    res.status(500).json({ error: 'Failed to fetch streak' })
  }
})

// Get user badges
router.get('/:userId/badges', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    // TODO: Implement get user badges logic
    res.json([])
  } catch (error) {
    console.error('Error fetching badges:', error)
    res.status(500).json({ error: 'Failed to fetch badges' })
  }
})

// Get current user badges
router.get('/me/badges', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).userId
    // TODO: Implement get user badges logic
    res.json([])
  } catch (error) {
    console.error('Error fetching badges:', error)
    res.status(500).json({ error: 'Failed to fetch badges' })
  }
})

// Get user profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await userRepository.findById(id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// Update user profile
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).userId
    const { username, email, avatar } = req.body

    // Validate input
    if (username && username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }

    if (username && username.length > 20) {
      return res.status(400).json({ error: 'Username must be at most 20 characters' })
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' })
      }

      // Check if email is already taken by another user
      const existingUser = await userRepository.findByEmail(email)
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email already in use' })
      }
    }

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await userRepository.findByUsername(username)
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Username already taken' })
      }
    }

    // Update user
    const updates: any = {}
    if (username) updates.username = username
    if (email) updates.email = email
    if (avatar) updates.avatar = avatar

    const updatedUser = await userRepository.updateProfile(userId, updates)

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user profile' })
  }
})

// Get user analytics
router.get('/:id/analytics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // TODO: Implement get user analytics logic
    res.json({
      userId: id,
      activityTimeline: [],
      skillDistribution: [],
      progressOverTime: [],
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

export default router
