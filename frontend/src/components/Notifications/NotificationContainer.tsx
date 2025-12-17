import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNotification } from '../../contexts/NotificationContext'
import { Toast } from './Toast'

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification()

  return (
    <div
      className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
