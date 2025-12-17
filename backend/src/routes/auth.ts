import { Router, Response, Request } from 'express'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import GitHubOAuthService from '../services/githubOAuthService'
import githubUserRepository from '../database/repositories/githubUserRepository'
import userRepository from '../database/repositories/userRepository'

const router = Router()

// Initialize GitHub OAuth service
const githubOAuth = new GitHubOAuthService({
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/auth/github/callback',
})

// GitHub OAuth authorization URL endpoint
router.get('/github/authorize', (_req, res: Response) => {
  try {
    const state = randomUUID()
    // Store state in session/cache for verification (simplified for now)
    const authUrl = githubOAuth.getAuthorizationUrl(state)
    res.json({ authUrl, state })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate authorization URL' })
  }
})

// GitHub OAuth callback endpoint
router.post('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code, userId } = req.body

    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing code or userId' })
    }

    // Handle OAuth callback
    const { user, githubUser } = await githubOAuth.handleOAuthCallback(code, userId)

    return res.json({
      success: true,
      user,
      githubUser,
      message: 'GitHub account linked successfully',
    })
  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    return res.status(500).json({ error: 'Failed to link GitHub account' })
  }
})

// Get GitHub user info for logged-in user
router.get('/github/user', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const githubUser = await githubUserRepository.findByUserId(userId)

    if (!githubUser) {
      return res.status(404).json({ error: 'GitHub account not linked' })
    }

    return res.json(githubUser)
  } catch (error) {
    console.error('Error fetching GitHub user:', error)
    return res.status(500).json({ error: 'Failed to fetch GitHub user info' })
  }
})

// Unlink GitHub account
router.post('/github/unlink', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const success = await githubUserRepository.delete(userId)

    if (!success) {
      return res.status(404).json({ error: 'GitHub account not linked' })
    }

    return res.json({ success: true, message: 'GitHub account unlinked' })
  } catch (error) {
    console.error('Error unlinking GitHub account:', error)
    return res.status(500).json({ error: 'Failed to unlink GitHub account' })
  }
})

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user by email
    const user = await userRepository.findByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user
    res.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const existingUsername = await userRepository.findByUsername(username)
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await userRepository.create({
      username,
      email,
      passwordHash,
      level: 1,
      totalXp: 0,
      role: 'student',
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Remove sensitive data
    const { passwordHash: _, ...userWithoutPassword } = newUser
    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Logout endpoint
router.post('/logout', (_req, res: Response) => {
  // TODO: Implement logout logic
  res.json({ message: 'Logout endpoint' })
})

export default router
