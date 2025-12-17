import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err)
})

export async function initializeRedis() {
  try {
    await redisClient.connect()
    console.log('Redis connected successfully')
  } catch (err) {
    console.error('Failed to connect to Redis:', err)
    throw err
  }
}

export async function cacheLeaderboard(
  period: 'daily' | 'weekly' | 'monthly',
  entries: any[]
) {
  const key = `leaderboard:${period}`
  await redisClient.setEx(key, 3600, JSON.stringify(entries)) // Cache for 1 hour
}

export async function getLeaderboardFromCache(
  period: 'daily' | 'weekly' | 'monthly'
) {
  const key = `leaderboard:${period}`
  const cached = await redisClient.get(key)
  return cached ? JSON.parse(cached) : null
}

export async function invalidateLeaderboardCache() {
  await redisClient.del('leaderboard:daily')
  await redisClient.del('leaderboard:weekly')
  await redisClient.del('leaderboard:monthly')
}

export default redisClient
