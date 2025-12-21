import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout, PageTransition } from './components/Navigation'
import { Login } from './components/Auth/Login'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Spinner } from './components/Loading'
import { User } from './types/index'
import { api } from './utils/api'
import { mockUser } from './utils/mockData'

// Lazy load page components
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })))
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))
const TeacherDashboardPage = lazy(() => import('./pages/TeacherDashboardPage').then(m => ({ default: m.TeacherDashboardPage })))
const FocusLockPage = lazy(() => import('./pages/FocusLockPage').then(m => ({ default: m.FocusLockPage })))
const FeedbackPage = lazy(() => import('./pages/FeedbackPage').then(m => ({ default: m.FeedbackPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const AssignmentsPage = lazy(() => import('./pages/AssignmentsPage').then(m => ({ default: m.AssignmentsPage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const DemoPage = lazy(() => import('./pages/DemoPage').then(m => ({ default: m.DemoPage })))
const AIOpsPage = lazy(() => import('./pages/AIOpsPage').then(m => ({ default: m.AIOpsPage })))
const DevOpsPage = lazy(() => import('./pages/DevOpsPage').then(m => ({ default: m.DevOpsPage })))

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <Spinner size="lg" />
  </div>
)

function App() {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [debugError, setDebugError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('App: Initializing auth...')
        const storedToken = localStorage.getItem('token')
        console.log('App: Token found:', !!storedToken)
        
        if (!storedToken) {
          console.log('App: No token, showing login')
          setLoading(false)
          setIsAuthenticated(false)
          return
        }

        console.log('App: Fetching user data...')
        try {
          const userData = await api.get('/users/me')
          console.log('App: User data received:', userData)
          setUser(userData)
          setIsAuthenticated(true)
        } catch (apiErr) {
          console.warn('App: API call failed, using mock data:', apiErr)
          // Use mock data for demo purposes
          setUser(mockUser)
          setIsAuthenticated(true)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('App: Failed to initialize:', errorMsg)
        setDebugError(errorMsg)
        localStorage.removeItem('token')
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const handleLoginSuccess = (_token: string, newUser: any) => {
    console.log('App: Login successful, user:', newUser)
    // Use mock user data for demo purposes
    const userToSet = newUser || mockUser
    setUser(userToSet)
    setIsAuthenticated(true)
    setLoading(false)
    setDebugError(null)
  }

  if (loading) {
    return <LoadingFallback />
  }

  if (debugError) {
    return (
      <ThemeProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 max-w-md">
              <h2 className="text-xl font-bold text-red-400 mb-4">Error Loading App</h2>
              <p className="text-red-300 mb-4">{debugError}</p>
              <p className="text-gray-400 text-sm mb-4">Check the browser console for more details.</p>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  window.location.reload()
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded"
              >
                Clear & Reload
              </button>
            </div>
          </div>
        </NotificationProvider>
      </ThemeProvider>
    )
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <NotificationProvider>
          <Login onLoginSuccess={handleLoginSuccess} />
        </NotificationProvider>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Layout user={user}>
            <PageTransition>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<DashboardPage user={user} />} />
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/submissions" element={<SubmissionsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/teacher" element={<TeacherDashboardPage />} />
                  <Route path="/focus" element={<FocusLockPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/aiops" element={<AIOpsPage />} />
                  <Route path="/devops" element={<DevOpsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </PageTransition>
          </Layout>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
