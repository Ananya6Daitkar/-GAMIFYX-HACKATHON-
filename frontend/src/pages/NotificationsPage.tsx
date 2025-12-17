import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, AlertCircle, CheckCircle, Info, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Assignment Submitted',
    message: 'Your "Build REST API" submission was auto-graded with a score of 92/100',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'XP Earned',
    message: 'You earned 120 XP from your latest submission!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Assignment Deadline Soon',
    message: 'Your "Deploy to AWS" assignment is due in 2 days',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '4',
    type: 'info',
    title: 'New Assignment Available',
    message: 'Your teacher has posted a new assignment: "Write Unit Tests"',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '5',
    type: 'success',
    title: 'Badge Unlocked',
    message: 'You unlocked the "Code Master" badge!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '6',
    type: 'error',
    title: 'Submission Failed',
    message: 'Your submission failed validation. Please check the required files.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
]

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'error' | 'warning' | 'info'>('all')

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.read
    return notif.type === filter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Bell className="w-5 h-5 text-cyan-400" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30'
      case 'error':
        return 'bg-red-500/10 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30'
      default:
        return 'bg-cyan-500/10 border-cyan-500/30'
    }
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 md:px-6 py-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-bold text-white font-orbitron">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full">
                <p className="text-red-400 font-semibold">{unreadCount} unread</p>
              </div>
            )}
          </div>
          <p className="text-gray-400">Stay updated with your learning progress</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          {(['all', 'unread', 'success', 'error', 'warning', 'info'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 capitalize ${
                filter === f
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/50'
                  : 'bg-slate-700/50 text-gray-400 hover:text-white border border-slate-600/50'
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border rounded-lg p-4 backdrop-blur-md transition-all duration-300 ${getColor(notif.type)} ${!notif.read ? 'ring-2 ring-cyan-500/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getIcon(notif.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{notif.title}</h3>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{notif.message}</p>
                      <p className="text-gray-500 text-xs">{formatTime(notif.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 text-xs font-medium hover:bg-cyan-500/30 transition-all duration-300"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 hover:bg-red-500/20 rounded transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No notifications</p>
              <p className="text-gray-500 text-sm mt-2">You're all caught up!</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
