/**
 * API Client Factory
 * Factory to create the appropriate API client based on configuration
 */

import { apiClient } from './api-client'
import { stellarApiClient } from './stellar-api-client'
import { API_CONFIG } from './api-config'

// Type for the unified API client interface
export type UnifiedApiClient = {
  // Authentication
  login: (credentials: any) => Promise<any>
  register: (userData: any) => Promise<any>
  logout: () => Promise<any>
  refreshToken: () => Promise<any>
  getProfile: (accountAddress?: string) => Promise<any>

  // Events
  getEvents: (page?: number, limit?: number, filters?: any) => Promise<any>
  getEventById: (id: string) => Promise<any>
  createEvent: (eventData: any) => Promise<any>
  updateEvent: (id: string, eventData: any) => Promise<any>
  deleteEvent: (id: string) => Promise<any>
  joinEvent: (id: string, userAddress?: string) => Promise<any>
  leaveEvent: (id: string, userAddress?: string) => Promise<any>
  registerForEvent: (id: string, ticketBatchId: string, userAddress?: string) => Promise<any>
  approveEventRegistration: (id: string, userId: string) => Promise<any>

  // Users
  updateProfile: (userData: any) => Promise<any>
  getUserEvents: (userAddress?: string) => Promise<any>

  // Notifications
  getNotifications: (userAddress?: string) => Promise<any>
  markNotificationAsRead: (id: string) => Promise<any>
  markAllNotificationsAsRead: (userAddress?: string) => Promise<any>

  // Payments
  getBalance: (userAddress?: string) => Promise<any>
  getTransactions: (userAddress?: string) => Promise<any>
  transferP2P: (fromAddress: string, toAddress: string, amount: number) => Promise<any>
  buyTokens: (userAddress: string, amount: number) => Promise<any>

  // DEX
  getPools: () => Promise<any>
  createPool: (tokenA: string, tokenB: string, amountA: number, amountB: number) => Promise<any>
  addLiquidity: (poolId: string, amountA: number, amountB: number) => Promise<any>
  removeLiquidity: (poolId: string, amount: number) => Promise<any>
  swap: (tokenA: string, tokenB: string, amount: number) => Promise<any>
  getSwapQuote: (tokenA: string, tokenB: string, amount: number) => Promise<any>

  // Analytics
  getDashboardStats: () => Promise<any>
  getEventStats: () => Promise<any>
  getUserStats: () => Promise<any>
  getPaymentStats: () => Promise<any>

  // Goals
  getGoals: (userAddress?: string) => Promise<any>
  createGoal: (goalData: any) => Promise<any>
  updateGoal: (id: string, goalData: any) => Promise<any>
  deleteGoal: (id: string) => Promise<any>

  // Charts
  getChartsData: (userAddress?: string) => Promise<any>
}

/**
 * Create the appropriate API client based on configuration
 */
export const createApiClient = (): UnifiedApiClient => {
  const useStellar = !API_CONFIG.MOCK.ENABLED && API_CONFIG.STELLAR.CONTRACT.ADDRESS

  if (useStellar) {
    console.log('🌟 Using Stellar API Client')
    return stellarApiClient as unknown as UnifiedApiClient
  } else {
    console.log('🔧 Using Mock API Client')
    return apiClient as unknown as UnifiedApiClient
  }
}

// Export the default API client instance
export const apiClientInstance = createApiClient()

// Export individual clients for direct access if needed
export { apiClient as mockApiClient, stellarApiClient as stellarApiClientInstance }
