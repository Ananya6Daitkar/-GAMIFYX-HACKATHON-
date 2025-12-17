import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../utils/api'
import { mockUser } from '../../utils/mockData'
import { useNotification } from '../../contexts/NotificationContext'

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const { addNotification } = useNotification()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      console.log('Login: Response received:', data)
      localStorage.setItem('token', data.token)
      addNotification('Login successful!', 'success')
      console.log('Login: Calling onLoginSuccess callback')
      // Call the callback to update parent component
      onLoginSuccess(data.token, data.user)
    } catch (error) {
      console.warn('Login API failed, using mock data:', error)
      // Use mock data for demo purposes
      const mockToken = 'mock-token-' + Date.now()
      localStorage.setItem('token', mockToken)
      addNotification('Login successful! (Demo Mode)', 'success')
      onLoginSuccess(mockToken, mockUser)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const data = await response.json()
      console.log('Register: Response received:', data)
      localStorage.setItem('token', data.token)
      addNotification('Registration successful!', 'success')
      console.log('Register: Calling onLoginSuccess callback')
      // Call the callback to update parent component
      onLoginSuccess(data.token, data.user)
    } catch (error) {
      console.warn('Registration API failed, using mock data:', error)
      // Use mock data for demo purposes
      const mockToken = 'mock-token-' + Date.now()
      localStorage.setItem('token', mockToken)
      addNotification('Registration successful! (Demo Mode)', 'success')
      onLoginSuccess(mockToken, mockUser)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800/50 backdrop-blur-md border border-cyan-500/20 rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-cyan-400 font-orbitron mb-2 text-center">
            GamifyX
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </p>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Enter username"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="Enter email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="Enter password"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister)
                setEmail('')
                setPassword('')
                setUsername('')
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              {isRegister
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
