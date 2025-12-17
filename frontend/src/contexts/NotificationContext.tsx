import React, { createContext, useContext, useState, useCallback } from 'react'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
  icon?: React.ReactNode
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (
    message: string,
    type: NotificationType,
    duration?: number
  ) => string
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(
    (message: string, type: NotificationType, duration = 5000) => {
      const id = `notification-${Date.now()}-${Math.random()}`

      const notification: Notification = {
        id,
        type,
        message,
        duration,
      }

      setNotifications((prev) => [...prev, notification])

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }

      return id
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification must be used within NotificationProvider'
    )
  }
  return context
}
