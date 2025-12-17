import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import dotenv from 'dotenv'
import { initializeDatabase } from './database/connection'
import { initializeRedis } from './database/redis'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import submissionRoutes from './routes/submissions'
import gamificationRoutes from './routes/gamification'
import analyticsRoutes from './routes/analytics'
import assignmentRoutes from './routes/assignments'
import webhookRoutes from './routes/webhooks'
import feedbackRoutes from './routes/feedback'
import teacherRoutes from './routes/teacher'
import competitionRoutes from './routes/competitions'
import realtimeService from './services/realtimeService'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
})

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}

// Middleware
app.use(cors(corsOptions))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Store raw body for webhook signature verification (only for webhook routes)
app.use('/api/webhooks', (req, res, next) => {
  let data = ''
  req.on('data', (chunk) => {
    data += chunk
  })
  req.on('end', () => {
    (req as any).rawBody = data
    next()
  })
})

// Security Headers Middleware
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:"
  )
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  next()
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
// Public routes (no authentication required)
app.use('/api/auth', authRoutes)
app.use('/api/webhooks', webhookRoutes)

// Protected routes (authentication required)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/submissions', authMiddleware, submissionRoutes)
app.use('/api/gamification', authMiddleware, gamificationRoutes)
app.use('/api/analytics', authMiddleware, analyticsRoutes)
app.use('/api/assignments', authMiddleware, assignmentRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/teacher', authMiddleware, teacherRoutes)
app.use('/api/competitions', authMiddleware, competitionRoutes)

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Initialize real-time service with Socket.io
realtimeService.initialize(io)

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase()
    
    // Initialize Redis connection
    await initializeRedis()
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer()
}

export { app, io, startServer, realtimeService }
