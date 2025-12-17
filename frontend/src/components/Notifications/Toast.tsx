import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { Notification, NotificationType } from '../../contexts/NotificationContext'

interface ToastProps {
  notification: Notification
  onClose: (id: string) => void
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-400" />
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-400" />
  }
}

const getStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-300',
      }
    case 'error':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-300',
      }
    case 'warning':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-300',
      }
    case 'info':
    default:
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-300',
      }
  }
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const styles = getStyles(notification.type)
  const icon = getIcon(notification.type)

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onClose(notification.id)
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification, onClose])

  const getAriaLive = (type: NotificationType) => {
    return type === 'error' ? 'assertive' : 'polite'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      transition={{ duration: 0.3 }}
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 flex items-start gap-3 backdrop-blur-md shadow-lg max-w-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400`}
      role="alert"
      aria-live={getAriaLive(notification.type)}
      aria-atomic="true"
      tabIndex={0}
    >
      <div className="flex-shrink-0 mt-0.5" aria-hidden="false">
        {icon}
      </div>
      <div className="flex-1">
        <p className={`${styles.text} text-sm font-medium`}>
          {notification.message}
        </p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded p-1"
        aria-label={`Close ${notification.type} notification: ${notification.message}`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
