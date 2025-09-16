'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../ui'
import { Bell, AlertTriangle, CheckCircle, Info, X, Settings } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationsCardProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationsCard({ 
  notifications, 
  onMarkAsRead, 
  onDismiss, 
  onMarkAllAsRead 
}: NotificationsCardProps) {
  const [showAll, setShowAll] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-500/5'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/5'
      case 'error':
        return 'border-l-red-500 bg-red-500/5'
      case 'info':
        return 'border-l-blue-500 bg-blue-500/5'
      default:
        return 'border-l-gray-500 bg-gray-500/5'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5)

  return (
    <Card variant="premium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-white">Notificações</CardTitle>
              <p className="text-sm text-gray-400">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma notificação</p>
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? 'opacity-100' : 'opacity-60'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">{notification.title}</h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
                      
                      {notification.action && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={notification.action.onClick}
                          className="mt-2 p-0 h-auto text-primary-400 hover:text-primary-300"
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 ml-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                        className="p-1 h-auto"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="p-1 h-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {notifications.length > 5 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Ver Menos' : `Ver Todas (${notifications.length})`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
