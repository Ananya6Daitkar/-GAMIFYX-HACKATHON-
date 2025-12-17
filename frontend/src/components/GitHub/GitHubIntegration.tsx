import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface GitHubIntegrationProps {
  isConnected?: boolean
  username?: string
  onConnect?: () => void
  onDisconnect?: () => void
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  isConnected = false,
  username = '',
  onConnect,
  onDisconnect,
}) => {
  const [connecting, setConnecting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      // In production, this would redirect to GitHub OAuth
      const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID || 'your-client-id'
      const redirectUri = `${window.location.origin}/auth/github/callback`
      const state = Math.random().toString(36).substring(7)
      
      // Store state in sessionStorage for verification
      sessionStorage.setItem('github_oauth_state', state)
      
      // Redirect to GitHub OAuth
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${state}`
    } catch (error) {
      console.error('Failed to connect GitHub:', error)
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 md:p-8 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Github className="w-8 h-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white font-orbitron">GitHub Integration</h2>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Connected</span>
          </div>
        )}
      </div>

      {isConnected ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Connected Status */}
          <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Github className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Connected as</p>
                <p className="text-white font-semibold text-lg">{username}</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-4">Connected Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Auto-Grading</p>
                  <p className="text-gray-400 text-sm">Automatic code evaluation on push</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Webhook Integration</p>
                  <p className="text-gray-400 text-sm">Real-time push notifications</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">XP Rewards</p>
                  <p className="text-gray-400 text-sm">Earn XP for quality commits</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">AI Feedback</p>
                  <p className="text-gray-400 text-sm">Code analysis and suggestions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-gray-400 hover:text-white transition-colors duration-300"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {/* Details */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 space-y-3"
            >
              <div>
                <p className="text-gray-400 text-sm">GitHub Username</p>
                <p className="text-cyan-400 font-mono">{username}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-green-400 font-medium">✓ Active</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Permissions</p>
                <p className="text-gray-300 text-sm">repo, user</p>
              </div>
            </motion.div>
          )}

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-medium hover:bg-red-500/30 hover:border-red-500/70 transition-all duration-300"
          >
            Disconnect GitHub
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Info */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Why Connect GitHub?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span className="text-gray-300">Automatic code evaluation on every push</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span className="text-gray-300">Earn XP for quality commits and code</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span className="text-gray-300">Get AI-powered feedback on your code</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span className="text-gray-300">Real-time notifications for submissions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">✓</span>
                <span className="text-gray-300">Track your progress and achievements</span>
              </li>
            </ul>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="w-5 h-5" />
                Connect with GitHub
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-300 text-sm">
              We only request access to your public repositories. Your credentials are never stored on our servers.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
