'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../ui/Button'
import { NotificationBell } from '../features/notifications/NotificationBell'
import { Menu, X, Search } from 'lucide-react'
import { apiClientInstance } from '../../app/utils/api-client-factory'
import { Notification } from '../../app/types'

interface NavbarProps {
  onSearchClick?: () => void
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoadingNotifications(true)
        const response = await apiClientInstance.getNotifications()
        if (response.success) {
          setNotifications(response.data)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setIsLoadingNotifications(false)
      }
    }

    loadNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClientInstance.markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiClientInstance.markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-eventcoin rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-white">EventCoin</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
              Eventos
            </Link>
            <Link href="/payments" className="text-gray-300 hover:text-white transition-colors">
              Pagamentos
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              Configurações
            </Link>
          </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center space-x-4">
        <button
          onClick={onSearchClick}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          title="Buscar Eventos"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
        <NotificationBell 
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDismiss={handleDismiss}
        />
        <Button variant="ghost" size="sm">
          Entrar
        </Button>
        <Button variant="primary" size="sm">
          Começar
        </Button>
      </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link
                href="/events"
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Eventos
              </Link>
              <Link
                href="/payments"
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pagamentos
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Configurações
              </Link>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-gray-300">Buscar</span>
            <button
              onClick={onSearchClick}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-gray-300">Notificações</span>
            <NotificationBell 
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDismiss={handleDismiss}
        />
          </div>
              <div className="flex flex-col space-y-2 px-4">
                <Button variant="ghost" size="sm" className="w-full">
                  Entrar
                </Button>
                <Button variant="primary" size="sm" className="w-full">
                  Começar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
