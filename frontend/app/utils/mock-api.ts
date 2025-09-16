/**
 * EventCoin Mock API
 * Centralized mock API implementation
 * Following the pattern from DeFi Risk Guardian
 */

import { API_CONFIG } from './api-config'
import { mockEvents, mockNotifications, mockUsers, mockPayments, mockDEXPools, mockDashboardStats } from './mock-data'
import { Event, Notification, User, Payment, DEXPool, DashboardStats, ApiResponse, PaginatedResponse, EventFilters, CreateEventForm, LoginForm, RegisterForm, AuthUser } from '../types'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API class
class MockAPI {
  private async simulateRequest<T>(data: T): Promise<ApiResponse<T>> {
    await delay(API_CONFIG.MOCK.DELAY)
    return {
      success: true,
      data,
      message: 'Success'
    }
  }

  // Helper method to fix context issues
  private async safeSimulateRequest<T>(data: T): Promise<ApiResponse<T>> {
    await delay(API_CONFIG.MOCK.DELAY)
    return {
      success: true,
      data,
      message: 'Success'
    }
  }

  // Static helper method to avoid context issues
  private static async staticSimulateRequest<T>(data: T): Promise<ApiResponse<T>> {
    await delay(API_CONFIG.MOCK.DELAY)
    return {
      success: true,
      data,
      message: 'Success'
    }
  }

  private async simulatePaginatedRequest<T>(data: T[], page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<T>>> {
    await delay(API_CONFIG.MOCK.DELAY)
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: data.length,
          totalPages: Math.ceil(data.length / limit)
        }
      },
      message: 'Success'
    }
  }

  // Authentication Endpoints
  async login(credentials: LoginForm): Promise<ApiResponse<AuthUser>> {
    const user = mockUsers[0] // Use first mock user
    const authUser: AuthUser = {
      ...user,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    }
    await delay(API_CONFIG.MOCK.DELAY)
    return {
      success: true,
      data: authUser,
      message: 'Success'
    }
  }

  async register(userData: RegisterForm): Promise<ApiResponse<AuthUser>> {
    const newUser: AuthUser = {
      id: String(mockUsers.length + 1),
      name: userData.name,
      email: userData.email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    }
    return MockAPI.staticSimulateRequest(newUser)
  }

  async logout(): Promise<ApiResponse<null>> {
    return MockAPI.staticSimulateRequest(null)
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return MockAPI.staticSimulateRequest({
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token'
    })
  }

  async getProfile(): Promise<ApiResponse<User>> {
    await delay(API_CONFIG.MOCK.DELAY)
    return {
      success: true,
      data: mockUsers[0],
      message: 'Success'
    }
  }

  // Events Endpoints
  async getEvents(params?: { page?: number; limit?: number; filters?: EventFilters }): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const filters = params?.filters
    
    console.log('🎭 MockAPI.getEvents called with:', { page, limit, filters, mockEventsCount: mockEvents.length })
    
    let filteredEvents = [...mockEvents]
    
    if (filters) {
      if (filters.search) {
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          event.description.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      
      if (filters.status) {
        filteredEvents = filteredEvents.filter(event => event.status === filters.status)
      }
      
      if (filters.category) {
        filteredEvents = filteredEvents.filter(event => event.category === filters.category)
      }
    }
    
    console.log('🎭 Filtered events count:', filteredEvents.length)
    
    // Simulate pagination directly
    await delay(API_CONFIG.MOCK.DELAY)
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filteredEvents.slice(startIndex, endIndex)
    
    const result = {
      success: true,
      data: {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: filteredEvents.length,
          totalPages: Math.ceil(filteredEvents.length / limit)
        }
      },
      message: 'Success'
    }
    
    console.log('🎭 MockAPI.getEvents result:', result)
    return result
  }

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    const event = mockEvents.find(e => e.id === id)
    if (!event) {
      return {
        success: false,
        data: null as any,
        error: 'Event not found'
      }
    }
    return MockAPI.staticSimulateRequest(event)
  }

  async createEvent(eventData: CreateEventForm): Promise<ApiResponse<Event>> {
    const newEvent: Event = {
      id: String(mockEvents.length + 1),
      ...eventData,
      attendees: 0,
      rating: 0,
      status: 'active',
      image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop',
      organizer: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return MockAPI.staticSimulateRequest(newEvent)
  }

  async updateEvent(id: string, eventData: Partial<CreateEventForm>): Promise<ApiResponse<Event>> {
    const event = mockEvents.find(e => e.id === id)
    if (!event) {
      return {
        success: false,
        data: null as any,
        error: 'Event not found'
      }
    }
    
    const updatedEvent = { ...event, ...eventData, updatedAt: new Date().toISOString() }
    return MockAPI.staticSimulateRequest(updatedEvent)
  }

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    return MockAPI.staticSimulateRequest(null)
  }

  async joinEvent(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      message: 'Successfully joined event'
    })
  }

  async leaveEvent(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      message: 'Successfully left event'
    })
  }

  async registerForEvent(id: string, ticketBatchId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      message: 'Successfully registered for event'
    })
  }

  async approveEventRegistration(id: string, userId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      message: 'Registration approved'
    })
  }

  // Users Endpoints
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const updatedUser = { ...mockUsers[0], ...userData }
    return MockAPI.staticSimulateRequest(updatedUser)
  }

  async getUserEvents(): Promise<ApiResponse<Event[]>> {
    return MockAPI.staticSimulateRequest(mockEvents.slice(0, 3)) // Return first 3 events
  }

  // Notifications Endpoints
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return MockAPI.staticSimulateRequest(mockNotifications)
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return MockAPI.staticSimulateRequest({ success: true })
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return MockAPI.staticSimulateRequest({ success: true })
  }

  // Payments Endpoints
  async getBalance(): Promise<ApiResponse<{ balance: number; tktBalance: number }>> {
    await delay(API_CONFIG.MOCK.DELAY)
    return {
      success: true,
      data: {
        balance: mockUsers[0].balance,
        tktBalance: mockUsers[0].tktBalance
      },
      message: 'Success'
    }
  }

  async getTransactions(): Promise<ApiResponse<Payment[]>> {
    await delay(API_CONFIG.MOCK.DELAY)
    return {
      success: true,
      data: mockPayments,
      message: 'Success'
    }
  }

  async transferP2P(recipientId: string, amount: number): Promise<ApiResponse<{ success: boolean; transactionId: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      transactionId: `tx_${Date.now()}`
    })
  }

  async buyTokens(amount: number): Promise<ApiResponse<{ success: boolean; transactionId: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      transactionId: `tx_${Date.now()}`
    })
  }

  // DEX Endpoints
  async getPools(): Promise<ApiResponse<DEXPool[]>> {
    return MockAPI.staticSimulateRequest(mockDEXPools)
  }

  async createPool(tokenA: string, tokenB: string, amountA: number, amountB: number): Promise<ApiResponse<{ success: boolean; poolId: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      poolId: `pool_${Date.now()}`
    })
  }

  async addLiquidity(poolId: string, amountA: number, amountB: number): Promise<ApiResponse<{ success: boolean; transactionId: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      transactionId: `tx_${Date.now()}`
    })
  }

  async removeLiquidity(poolId: string, amount: number): Promise<ApiResponse<{ success: boolean; transactionId: string }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      transactionId: `tx_${Date.now()}`
    })
  }

  async swap(tokenA: string, tokenB: string, amount: number): Promise<ApiResponse<{ success: boolean; transactionId: string; outputAmount: number }>> {
    return MockAPI.staticSimulateRequest({
      success: true,
      transactionId: `tx_${Date.now()}`,
      outputAmount: amount * 0.95 // Simulate 5% slippage
    })
  }

  async getSwapQuote(tokenA: string, tokenB: string, amount: number): Promise<ApiResponse<{ inputAmount: number; outputAmount: number; priceImpact: number; fee: number }>> {
    return MockAPI.staticSimulateRequest({
      inputAmount: amount,
      outputAmount: amount * 0.95,
      priceImpact: 0.5,
      fee: amount * 0.003
    })
  }

  // Analytics Endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return MockAPI.staticSimulateRequest(mockDashboardStats)
  }

  async getEventStats(): Promise<ApiResponse<any>> {
    return MockAPI.staticSimulateRequest(mockDashboardStats.eventStats)
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return MockAPI.staticSimulateRequest(mockDashboardStats.userStats)
  }

  async getPaymentStats(): Promise<ApiResponse<any>> {
    return MockAPI.staticSimulateRequest(mockDashboardStats.paymentStats)
  }
}

// Export singleton instance
export const mockAPI = new MockAPI()

// Export individual methods for easier testing
export const {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  registerForEvent,
  approveEventRegistration,
  updateProfile,
  getUserEvents,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getBalance,
  getTransactions,
  transferP2P,
  buyTokens,
  getPools,
  createPool,
  addLiquidity,
  removeLiquidity,
  swap,
  getSwapQuote,
  getDashboardStats,
  getEventStats,
  getUserStats,
  getPaymentStats
} = mockAPI
