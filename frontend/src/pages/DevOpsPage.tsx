import React from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Server, Zap } from 'lucide-react'
import { DeploymentStatus } from '../components/DevOps/DeploymentStatus'
import { InfrastructureHealth } from '../components/DevOps/InfrastructureHealth'

export const DevOpsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 md:px-6 py-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <GitBranch className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white font-orbitron">DevOps Dashboard</h1>
          </div>
          <p className="text-gray-400">Automated CI/CD pipelines, deployment monitoring, and infrastructure health</p>
        </motion.div>

        {/* Problem Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">🔴 The DevOps Learning Crisis</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              <span className="font-semibold text-red-400">60% of DevOps students drop out</span> because the field is uniquely challenging:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><span className="font-semibold text-white">Multiple Tools Required:</span> Docker, Kubernetes, CI/CD, Git, monitoring tools</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><span className="font-semibold text-white">Hands-On Practice Needed:</span> Can't learn DevOps from videos alone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><span className="font-semibold text-white">Complex Workflows:</span> Students learn tools in isolation, never see how they work together</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><span className="font-semibold text-white">Dual Expertise:</span> Requires understanding both development AND operations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><span className="font-semibold text-white">Fast-Evolving:</span> New technologies constantly emerging</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Solution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">✅ GamifyX DevOps Solution</h2>
          <p className="text-gray-300 mb-4">
            We teach DevOps by letting students <span className="font-semibold text-green-400">see the entire pipeline in action</span>:
          </p>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold text-lg">1.</span>
              <div>
                <p className="font-semibold text-white">Learn by Doing</p>
                <p className="text-sm">Students push code and watch it go through the entire DevOps pipeline in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold text-lg">2.</span>
              <div>
                <p className="font-semibold text-white">See the Whole Picture</p>
                <p className="text-sm">Understand how Docker, Kubernetes, CI/CD, and monitoring work together</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold text-lg">3.</span>
              <div>
                <p className="font-semibold text-white">Real Infrastructure</p>
                <p className="text-sm">Monitor actual uptime, CPU, memory, and deployment status</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold text-lg">4.</span>
              <div>
                <p className="font-semibold text-white">Gamified Learning</p>
                <p className="text-sm">Earn XP for successful deployments, unlock achievements, compete on leaderboards</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">CI/CD Pipeline</h3>
            </div>
            <p className="text-sm text-gray-300">Automated build, test, and deploy on every push</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white">Infrastructure</h3>
            </div>
            <p className="text-sm text-gray-300">Real-time monitoring of all system components</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Performance</h3>
            </div>
            <p className="text-sm text-gray-300">Track build times, test coverage, and deployment status</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CI/CD Pipeline Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md"
          >
            <DeploymentStatus />
          </motion.div>

          {/* Infrastructure Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-md"
          >
            <InfrastructureHealth />
          </motion.div>
        </div>

        {/* DevOps Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-cyan-500/30 rounded-lg p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 font-orbitron">DevOps Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">1. Code Push</span>
                <br />
                Student pushes to GitHub
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔨</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">2. Build</span>
                <br />
                Automated build process
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">3. Test</span>
                <br />
                Run automated tests
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">4. Deploy</span>
                <br />
                Deploy to production
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">5. Monitor</span>
                <br />
                Track performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 font-orbitron">DevOps Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">For Students</p>
                <p className="text-sm text-gray-300">Learn real DevOps practices and CI/CD workflows</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">For Teachers</p>
                <p className="text-sm text-gray-300">Monitor deployment quality and infrastructure health</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">Automated Testing</p>
                <p className="text-sm text-gray-300">Every push is automatically tested and validated</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">Production Ready</p>
                <p className="text-sm text-gray-300">Code is deployed to production automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">Real-time Monitoring</p>
                <p className="text-sm text-gray-300">Track infrastructure health and performance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <p className="font-semibold text-white">Failure Detection</p>
                <p className="text-sm text-gray-300">Identify build failures and deployment issues instantly</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* DevOps Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 font-orbitron">💡 Personalized DevOps Learning Paths</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">→</span>
              <div>
                <p className="font-semibold text-white">Master Docker Fundamentals</p>
                <p className="text-sm text-gray-300">Your deployments are failing. Learn containerization best practices with 5 hands-on labs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">→</span>
              <div>
                <p className="font-semibold text-white">Kubernetes Orchestration</p>
                <p className="text-sm text-gray-300">Scale your applications. Complete the Kubernetes course and deploy your first cluster</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">→</span>
              <div>
                <p className="font-semibold text-white">CI/CD Pipeline Optimization</p>
                <p className="text-sm text-gray-300">Your build time is 5 minutes. Optimize with caching and parallel testing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">→</span>
              <div>
                <p className="font-semibold text-white">Infrastructure Monitoring</p>
                <p className="text-sm text-gray-300">Learn to monitor CPU, memory, and uptime. Set up alerts for production issues</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">→</span>
              <div>
                <p className="font-semibold text-white">Learn from Top Performers</p>
                <p className="text-sm text-gray-300">Alex deployed 50% faster. See how they optimized their pipeline</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
