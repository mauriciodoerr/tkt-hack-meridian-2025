/**
 * EventCoin API Client
 * Centralized API client with mock/real API switching
 * Following the pattern from DeFi Risk Guardian
 */

import { API_CONFIG } from './api-config'
import { mockAPI } from './mock-api'
import { ApiResponse, PaginatedResponse, Event, Notification, User, Payment, DEXPool, DashboardStats, EventFilters, CreateEventForm, LoginForm, RegisterForm, AuthUser } from '../types'

// API Client class
class APIClient {
  private baseURL: string
  private useMock: boolean

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.useMock = API_CONFIG.MOCK.ENABLED
    
    console.log('🔧 APIClient initialized:', {
      baseURL: this.baseURL,
      useMock: this.useMock,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK
    })
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    console.log('🚀 API Request:', { endpoint, method: options.method || 'GET', useMock: this.useMock })
    
    if (this.useMock) {
      // Use mock API
      const mockMethod = this.getMockMethod(endpoint, options.method || 'GET')
      if (mockMethod) {
        console.log('✅ Using mock method for:', endpoint)
        try {
          // For GET requests, extract parameters from endpoint
          let mockParams = undefined
          if (options.method === 'GET' || !options.method) {
            const url = new URL(`http://localhost${endpoint}`)
            const page = parseInt(url.searchParams.get('page') || '1')
            const limit = parseInt(url.searchParams.get('limit') || '10')
            mockParams = { page, limit }
          } else {
            mockParams = options.body ? JSON.parse(options.body as string) : undefined
          }
          
          console.log('🎯 Calling mock method with params:', mockParams)
          const result = await mockMethod(mockParams)
          console.log('📦 Mock result:', result)
          return result
        } catch (error) {
          console.error('❌ Mock method failed:', error)
          throw error
        }
      } else {
        console.log('❌ No mock method found for:', endpoint)
        // Fallback to mock data directly
        if (endpoint.startsWith('/events')) {
          console.log('🔄 Fallback: Using direct mock data for events')
          return await mockAPI.getEvents(options.body ? JSON.parse(options.body as string) : undefined) as ApiResponse<T>
        }
      }
    }

    // Use real API
    const url = `${this.baseURL}/${API_CONFIG.VERSION}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          data: null as any,
          error: data.message || 'Request failed'
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Map endpoints to mock methods
  private getMockMethod(endpoint: string, method: string) {
    console.log('🔍 getMockMethod called with:', { endpoint, method })
    
    const mockMethods: Record<string, any> = {
      'GET /auth/profile': mockAPI.getProfile,
      'POST /auth/login': mockAPI.login,
      'POST /auth/register': mockAPI.register,
      'POST /auth/logout': mockAPI.logout,
      'POST /auth/refresh': mockAPI.refreshToken,
      'GET /events': mockAPI.getEvents,
      'GET /events/:id': mockAPI.getEventById,
      'POST /events': mockAPI.createEvent,
      'PUT /events/:id': mockAPI.updateEvent,
      'DELETE /events/:id': mockAPI.deleteEvent,
      'POST /events/:id/join': mockAPI.joinEvent,
      'POST /events/:id/leave': mockAPI.leaveEvent,
      'POST /events/:id/register': mockAPI.registerForEvent,
      'POST /events/:id/approve': mockAPI.approveEventRegistration,
      'PUT /users/profile': mockAPI.updateProfile,
      'GET /users/events': mockAPI.getUserEvents,
      'GET /notifications': mockAPI.getNotifications,
      'PUT /notifications/:id/read': mockAPI.markNotificationAsRead,
      'PUT /notifications/read-all': mockAPI.markAllNotificationsAsRead,
      'GET /payments/balance': mockAPI.getBalance,
      'GET /payments/transactions': mockAPI.getTransactions,
      'POST /payments/transfer': mockAPI.transferP2P,
      'POST /payments/buy-tokens': mockAPI.buyTokens,
      'GET /dex/pools': mockAPI.getPools,
      'POST /dex/pools': mockAPI.createPool,
      'POST /dex/pools/:id/liquidity': mockAPI.addLiquidity,
      'DELETE /dex/pools/:id/liquidity': mockAPI.removeLiquidity,
      'POST /dex/swap': mockAPI.swap,
      'GET /dex/quote': mockAPI.getSwapQuote,
      'GET /analytics/dashboard': mockAPI.getDashboardStats,
      'GET /analytics/events': mockAPI.getEventStats,
      'GET /analytics/users': mockAPI.getUserStats,
      'GET /analytics/payments': mockAPI.getPaymentStats,
    }

    // Remove query parameters and path parameters for matching
    const cleanEndpoint = endpoint.split('?')[0].replace(/\/\d+/g, '/:id')
    const key = `${method} ${cleanEndpoint}`
    
    console.log('🔍 Mock lookup:', { endpoint, cleanEndpoint, key, found: !!mockMethods[key] })
    
    return mockMethods[key]
  }

  // Authentication methods
  async login(credentials: LoginForm): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterForm): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request<null>('/auth/logout', {
      method: 'POST',
    })
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return this.request<{ token: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
    })
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile')
  }

  // Events methods
  async getEvents(page: number = 1, limit: number = 10, filters?: EventFilters): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters && Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined)))
    })
    
    const endpoint = `/events?${params}`
    console.log('📅 getEvents called with:', { page, limit, filters, endpoint })
    
    return this.request<PaginatedResponse<Event>>(endpoint)
  }

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}`)
  }

  async createEvent(eventData: CreateEventForm): Promise<ApiResponse<Event>> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  }

  async updateEvent(id: string, eventData: Partial<CreateEventForm>): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    })
  }

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/events/${id}`, {
      method: 'DELETE',
    })
  }

  async joinEvent(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/events/${id}/join`, {
      method: 'POST',
    })
  }

  async leaveEvent(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/events/${id}/leave`, {
      method: 'POST',
    })
  }

  async registerForEvent(id: string, ticketBatchId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/events/${id}/register`, {
      method: 'POST',
      body: JSON.stringify({ ticketBatchId }),
    })
  }

  async approveEventRegistration(id: string, userId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/events/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  // Users methods
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async getUserEvents(): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>('/users/events')
  }

  // Notifications methods
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/notifications')
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    })
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    })
  }

  // Payments methods
  async getBalance(): Promise<ApiResponse<{ balance: number; tktBalance: number }>> {
    return this.request<{ balance: number; tktBalance: number }>('/payments/balance')
  }

  async getTransactions(): Promise<ApiResponse<Payment[]>> {
    return this.request<Payment[]>('/payments/transactions')
  }

  async transferP2P(recipientId: string, amount: number): Promise<ApiResponse<{ success: boolean; transactionId: string }>> {
    return this.request<{ success: boolean; transactionId: string }>('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({ recipientId, amount }),
    })
  }

  async buyTokens(amount: number): Promise<ApiResponse<{ success: boolean; transactionId: string }>> {
    return this.request<{ success: boolean; transactionId: string }>('/payments/buy-tokens', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  // DEX methods
  async getPools(): Promise<ApiResponse<DEXPool[]>> {
    return this.request<DEXPool[]>('/dex/pools')
  }

  async createPool(tokenA: string, tokenB: string, amountA: number, amountB: number): Promise<ApiResponse<{ success: boolean; poolId: string }>> {
    return this.request<{ success: boolean; poolId: string }>('/dex/pools', {
      method: 'POST',
      body: JSON.stringify({ tokenA, tokenB, amountA, amountB }),
    })
  }

  async addLiquidity(poolId: string, amountA: number, amountB: number): Promise<ApiResponse<{ success: boolean; transactionId: string }>> {
    return this.request<{ success: boolean; transactionId: string }>(`/dex/pools/${poolId}/liquidity`, {
      method: 'POST',
      body: JSON.stringify({ amountA, amountB }),
    })
  }

  async removeLiquidity(poolId: string, amount: number): Promise<ApiResponse<{ success: boolean; transactionId: string }>> {
    return this.request<{ success: boolean; transactionId: string }>(`/dex/pools/${poolId}/liquidity`, {
      method: 'DELETE',
      body: JSON.stringify({ amount }),
    })
  }

  async swap(tokenA: string, tokenB: string, amount: number): Promise<ApiResponse<{ success: boolean; transactionId: string; outputAmount: number }>> {
    return this.request<{ success: boolean; transactionId: string; outputAmount: number }>('/dex/swap', {
      method: 'POST',
      body: JSON.stringify({ tokenA, tokenB, amount }),
    })
  }

  async getSwapQuote(tokenA: string, tokenB: string, amount: number): Promise<ApiResponse<{ inputAmount: number; outputAmount: number; priceImpact: number; fee: number }>> {
    const params = new URLSearchParams({
      tokenA,
      tokenB,
      amount: amount.toString(),
    })
    
    return this.request<{ inputAmount: number; outputAmount: number; priceImpact: number; fee: number }>(`/dex/quote?${params}`)
  }

  // Analytics methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/analytics/dashboard')
  }

  async getEventStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/analytics/events')
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/analytics/users')
  }

  async getPaymentStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/analytics/payments')
  }
}

// Export singleton instance
export const apiClient = new APIClient()

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
} = apiClient
