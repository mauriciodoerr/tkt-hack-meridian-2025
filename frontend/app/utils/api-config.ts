/**
 * EventCoin API Configuration
 * Centralized configuration for all API endpoints
 * Following the pattern from DeFi Risk Guardian
 */

export const API_CONFIG = {
  // Base URL - will be environment specific
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  
  // API Version
  VERSION: 'v1',
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
    },
    
    // Events
    EVENTS: {
      LIST: '/events',
      CREATE: '/events',
      GET_BY_ID: '/events/:id',
      UPDATE: '/events/:id',
      DELETE: '/events/:id',
      JOIN: '/events/:id/join',
      LEAVE: '/events/:id/leave',
      INVITE: '/events/:id/invite',
      REGISTER: '/events/:id/register',
      APPROVE: '/events/:id/approve',
      SEARCH: '/events/search',
      FILTER: '/events/filter',
    },
    
    // Users
    USERS: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
      EVENTS: '/users/events',
      NOTIFICATIONS: '/users/notifications',
      MARK_NOTIFICATION_READ: '/users/notifications/:id/read',
      MARK_ALL_READ: '/users/notifications/read-all',
    },
    
    // Payments & Tokens
    PAYMENTS: {
      BALANCE: '/payments/balance',
      TRANSACTIONS: '/payments/transactions',
      P2P_TRANSFER: '/payments/transfer',
      BUY_TOKENS: '/payments/buy-tokens',
      WITHDRAW: '/payments/withdraw',
    },
    
    // DEX & Liquidity
    DEX: {
      POOLS: '/dex/pools',
      CREATE_POOL: '/dex/pools',
      ADD_LIQUIDITY: '/dex/pools/:id/liquidity',
      REMOVE_LIQUIDITY: '/dex/pools/:id/liquidity',
      SWAP: '/dex/swap',
      QUOTE: '/dex/quote',
    },
    
    // Notifications
    NOTIFICATIONS: {
      LIST: '/notifications',
      MARK_READ: '/notifications/:id/read',
      MARK_ALL_READ: '/notifications/read-all',
      SETTINGS: '/notifications/settings',
    },
    
    // Analytics & Reports
    ANALYTICS: {
      DASHBOARD: '/analytics/dashboard',
      EVENTS_STATS: '/analytics/events',
      USER_STATS: '/analytics/users',
      PAYMENT_STATS: '/analytics/payments',
    },
  },
  
  // Request configuration
  REQUEST_CONFIG: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  // Mock configuration
  MOCK: {
    ENABLED: process.env.NEXT_PUBLIC_USE_MOCK === 'true' || process.env.NODE_ENV === 'development',
    DELAY: 500, // Simulate network delay
  },
}

/**
 * Helper function to build full API URL
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${endpoint}`
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value))
    })
  }
  
  return url
}

/**
 * Helper function to get endpoint by key
 */
export const getEndpoint = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.')
  let endpoint: unknown = API_CONFIG.ENDPOINTS
  
  for (const k of keys) {
    endpoint = (endpoint as Record<string, unknown>)[k]
  }
  
  if (typeof endpoint !== 'string') {
    throw new Error(`Invalid endpoint key: ${key}`)
  }
  
  return buildApiUrl(endpoint, params)
}
