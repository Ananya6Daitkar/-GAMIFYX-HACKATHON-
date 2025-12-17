import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gamifyx',
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export async function initializeDatabase() {
  try {
    const client = await pool.connect()
    console.log('Database connected successfully')
    client.release()
  } catch (err) {
    console.error('Failed to connect to database:', err)
    throw err
  }
}

export default pool
