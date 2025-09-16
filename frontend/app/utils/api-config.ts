/**
 * EventCoin API Configuration
 * Centralized configuration for all API endpoints and Stellar integration
 * Following the pattern from DeFi Risk Guardian
 */

export const API_CONFIG = {
  // Base URL - will be environment specific
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  
  // API Version
  VERSION: 'v1',
  
  // Stellar Network Configuration
  STELLAR: {
    NETWORK: {
      PASSphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
      HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
      RPC_URL: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
    },
    
    // Contract Configuration
    CONTRACT: {
      ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
      TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '',
    },
    
    // Horizon API Configuration
    HORIZON: {
      BASE_URL: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
      TIMEOUT: 10000,
      RETRY_ATTEMPTS: 3,
      RETRY_DELAY: 1000,
    },
  },
  
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
    ENABLED: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
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

/**
 * Stellar Helper Functions
 */

/**
 * Helper function to build Horizon API URL
 */
export const buildHorizonUrl = (endpoint: string): string => {
  return `${API_CONFIG.STELLAR.HORIZON.BASE_URL}${endpoint}`
}

/**
 * Helper function to build RPC URL
 */
export const buildRpcUrl = (): string => {
  return API_CONFIG.STELLAR.NETWORK.RPC_URL
}

/**
 * Helper function to get contract address
 */
export const getContractAddress = (): string => {
  if (!API_CONFIG.STELLAR.CONTRACT.ADDRESS) {
    throw new Error('Contract address not configured')
  }
  return API_CONFIG.STELLAR.CONTRACT.ADDRESS
}

/**
 * Helper function to get token address
 */
export const getTokenAddress = (): string => {
  if (!API_CONFIG.STELLAR.CONTRACT.TOKEN_ADDRESS) {
    throw new Error('Token address not configured')
  }
  return API_CONFIG.STELLAR.CONTRACT.TOKEN_ADDRESS
}

/**
 * Helper function to get network passphrase
 */
export const getNetworkPassphrase = (): string => {
  return API_CONFIG.STELLAR.NETWORK.PASSphrase
}

/**
 * Helper function to check if running on testnet
 */
export const isTestnet = (): boolean => {
  return API_CONFIG.STELLAR.NETWORK.PASSphrase.includes('Test')
}

/**
 * Helper function to get network name
 */
export const getNetworkName = (): string => {
  return isTestnet() ? 'Testnet' : 'Mainnet'
}
