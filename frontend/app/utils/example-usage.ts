/**
 * EventCoin Mock System - Example Usage
 * Examples of how to use the centralized mock system
 */

import { apiClientInstance } from './api-client-factory'
import { mockAPI } from './mock-api'
import { API_CONFIG } from './api-config'

// ========================================
// Example 1: Using the API Client (Recommended)
// ========================================

export async function exampleApiClientUsage() {
  try {
    // Get events - automatically uses mock in development
    const eventsResponse = await apiClientInstance.getEvents(1, 10)
    if (eventsResponse.success) {
      console.log('Events:', eventsResponse.data)
    }

    // Get user profile
    const profileResponse = await apiClientInstance.getProfile()
    if (profileResponse.success) {
      console.log('Profile:', profileResponse.data)
    }

    // Get balance
    const balanceResponse = await apiClientInstance.getBalance()
    if (balanceResponse.success) {
      console.log('Balance:', balanceResponse.data)
    }

    // Join an event
    const joinResponse = await apiClientInstance.joinEvent('event-1')
    if (joinResponse.success) {
      console.log('Joined event:', joinResponse.data)
    }

    // Transfer TKT tokens
    const transferResponse = await apiClientInstance.transferP2P('user-2', 100)
    if (transferResponse.success) {
      console.log('Transfer successful:', transferResponse.data)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}

// ========================================
// Example 2: Using Mock API Directly
// ========================================

export async function exampleMockApiUsage() {
  try {
    // Direct mock API usage (for testing)
    const eventsResponse = await mockAPI.getEvents(1, 10)
    console.log('Mock Events:', eventsResponse.data)

    const notificationsResponse = await mockAPI.getNotifications()
    console.log('Mock Notifications:', notificationsResponse.data)

    const poolsResponse = await mockAPI.getPools()
    console.log('Mock DEX Pools:', poolsResponse.data)

  } catch (error) {
    console.error('Mock API Error:', error)
  }
}

// ========================================
// Example 3: React Component Usage
// ========================================

import { useState, useEffect } from 'react'
import { Event, User, Notification } from '../types'

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const response = await apiClientInstance.getEvents(1, 10)
        
        if (response.success) {
          setEvents(response.data.data)
        } else {
          setError(response.error || 'Failed to fetch events')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return { events, loading, error }
}

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        const response = await apiClientInstance.getProfile()
        
        if (response.success) {
          setUser(response.data)
        } else {
          setError(response.error || 'Failed to fetch profile')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { user, loading, error }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true)
        const response = await apiClientInstance.getNotifications()
        
        if (response.success) {
          setNotifications(response.data)
        } else {
          setError(response.error || 'Failed to fetch notifications')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const response = await apiClientInstance.markNotificationAsRead(id)
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        )
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  return { notifications, loading, error, markAsRead }
}

// ========================================
// Example 4: Event Actions
// ========================================

export async function joinEvent(eventId: string) {
  try {
    const response = await apiClientInstance.joinEvent(eventId)
    if (response.success) {
      console.log('Successfully joined event:', response.data)
      return { success: true, message: response.data.message }
    } else {
      return { success: false, message: response.error || 'Failed to join event' }
    }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

export async function leaveEvent(eventId: string) {
  try {
    const response = await apiClientInstance.leaveEvent(eventId)
    if (response.success) {
      console.log('Successfully left event:', response.data)
      return { success: true, message: response.data.message }
    } else {
      return { success: false, message: response.error || 'Failed to leave event' }
    }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

export async function registerForEvent(eventId: string, ticketBatchId: string) {
  try {
    const response = await apiClientInstance.registerForEvent(eventId, ticketBatchId)
    if (response.success) {
      console.log('Successfully registered for event:', response.data)
      return { success: true, message: response.data.message }
    } else {
      return { success: false, message: response.error || 'Failed to register for event' }
    }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

// ========================================
// Example 5: Payment Actions
// ========================================

export async function transferTKT(recipientId: string, amount: number) {
  try {
    const response = await apiClientInstance.transferP2P(recipientId, amount)
    if (response.success) {
      console.log('Transfer successful:', response.data)
      return { success: true, transactionId: response.data.transactionId }
    } else {
      return { success: false, message: response.error || 'Transfer failed' }
    }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

export async function buyTKT(amount: number) {
  try {
    const response = await apiClientInstance.buyTokens(amount)
    if (response.success) {
      console.log('Purchase successful:', response.data)
      return { success: true, transactionId: response.data.transactionId }
    } else {
      return { success: false, message: response.error || 'Purchase failed' }
    }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

// ========================================
// Example 6: DEX Actions (Phase 2)
// ========================================

export async function getDEXPools() {
  try {
    const response = await apiClientInstance.getPools()
    if (response.success) {
      console.log('DEX Pools:', response.data)
      return { success: true, pools: response.data }
    } else {
      return { success: false, message: response.error || 'Failed to fetch pools' }
    }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

export async function swapTokens(tokenA: string, tokenB: string, amount: number) {
  try {
    const response = await apiClientInstance.swap(tokenA, tokenB, amount)
    if (response.success) {
      console.log('Swap successful:', response.data)
      return { 
        success: true, 
        transactionId: response.data.transactionId,
        outputAmount: response.data.outputAmount
      }
    } else {
      return { success: false, message: response.error || 'Swap failed' }
    }
  } catch (error) {
    return { success: false, message: 'Network error' }
  }
}

// ========================================
// Example 7: Configuration Check
// ========================================

export function checkMockConfiguration() {
  console.log('Mock Configuration:')
  console.log('- Mock Enabled:', API_CONFIG.MOCK.ENABLED)
  console.log('- Base URL:', API_CONFIG.BASE_URL)
  console.log('- API Version:', API_CONFIG.VERSION)
  console.log('- Mock Delay:', API_CONFIG.MOCK.DELAY)
  
  return {
    mockEnabled: API_CONFIG.MOCK.ENABLED,
    baseUrl: API_CONFIG.BASE_URL,
    version: API_CONFIG.VERSION,
    delay: API_CONFIG.MOCK.DELAY
  }
}

// ========================================
// Example 8: Error Handling
// ========================================

export async function handleApiError<T>(apiCall: () => Promise<{ success: boolean; data?: T; error?: string }>) {
  try {
    const response = await apiCall()
    
    if (response.success) {
      return { success: true, data: response.data }
    } else {
      console.error('API Error:', response.error)
      return { success: false, error: response.error || 'Unknown error' }
    }
  } catch (error) {
    console.error('Network Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    }
  }
}

// Usage example:
// const result = await handleApiError(() => apiClientInstance.getEvents(1, 10))
// if (result.success) {
//   console.log('Events:', result.data)
// } else {
//   console.error('Error:', result.error)
// }
