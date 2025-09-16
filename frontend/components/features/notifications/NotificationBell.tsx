'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Notification } from '../../../types'

interface NotificationBellProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onDismiss?: (id: string) => void
  onMarkAllAsRead?: () => void
}

export function NotificationBell({
  notifications = [],
  onMarkAsRead,
  onDismiss,
  onMarkAllAsRead
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use provided notifications
  const displayNotifications = notifications
  const unreadCount = displayNotifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMarkAsRead = (id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id)
    }
  }

  const handleDismiss = (id: string) => {
    if (onDismiss) {
      onDismiss(id)
    }
  }

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10'
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10'
      case 'error':
        return 'border-red-500/20 bg-red-500/10'
      case 'info':
      default:
        return 'border-blue-500/20 bg-blue-500/10'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <h3 className="text-white font-semibold">Notificações</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto scrollbar-modal">
            {displayNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="p-2">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg mb-2 border transition-all ${
                      notification.read
                        ? 'bg-dark-700 border-dark-600'
                        : getNotificationColor(notification.type)
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm ${
                              notification.read ? 'text-gray-300' : 'text-white'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              notification.read ? 'text-gray-400' : 'text-gray-300'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 rounded hover:bg-white/10 transition-colors"
                                title="Marcar como lida"
                              >
                                <Check className="w-3 h-3 text-gray-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDismiss(notification.id)}
                              className="p-1 rounded hover:bg-white/10 transition-colors"
                              title="Dispensar"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                        
                        {notification.action && (
                          <button
                            onClick={notification.action.onClick}
                            className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="p-4 border-t border-dark-700">
              <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}