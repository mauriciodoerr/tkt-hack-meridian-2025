/**
 * Stellar Helpers
 * Utility functions for Stellar network operations
 */

import { API_CONFIG, getNetworkPassphrase, isTestnet } from './api-config'
import { StellarAccount, StellarBalance, StellarTransaction, StellarOperation } from '../types'

/**
 * Format Stellar amount from stroops to human readable
 */
export const formatStellarAmount = (amount: string | number, decimals: number = 7): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return (numAmount / Math.pow(10, decimals)).toFixed(decimals)
}

/**
 * Convert human readable amount to stroops
 */
export const toStroops = (amount: number, decimals: number = 7): string => {
  return Math.floor(amount * Math.pow(10, decimals)).toString()
}

/**
 * Format Stellar address for display (show first 4 and last 4 characters)
 */
export const formatAddress = (address: string): string => {
  if (address.length <= 8) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

/**
 * Validate Stellar address format
 */
export const isValidAddress = (address: string): boolean => {
  // Basic Stellar address validation (56 characters, starts with G, M, T, or S)
  const stellarAddressRegex = /^[G-M][A-Z0-9]{55}$/
  return stellarAddressRegex.test(address)
}

/**
 * Get asset code from balance
 */
export const getAssetCode = (balance: StellarBalance): string => {
  if (balance.asset_type === 'native') {
    return 'XLM'
  }
  return balance.asset_code || 'Unknown'
}

/**
 * Get asset issuer from balance
 */
export const getAssetIssuer = (balance: StellarBalance): string | null => {
  if (balance.asset_type === 'native') {
    return null
  }
  return balance.asset_issuer || null
}

/**
 * Check if balance is for TKT token
 */
export const isTKTToken = (balance: StellarBalance): boolean => {
  return balance.asset_code === 'TKT' || balance.asset_type === 'native'
}

/**
 * Get TKT balance from account balances
 */
export const getTKTBalance = (balances: StellarBalance[]): number => {
  const tktBalance = balances.find(balance => 
    balance.asset_code === 'TKT' || balance.asset_type === 'native'
  )
  return tktBalance ? parseFloat(tktBalance.balance) : 0
}

/**
 * Get XLM balance from account balances
 */
export const getXLMBalance = (balances: StellarBalance[]): number => {
  const xlmBalance = balances.find(balance => balance.asset_type === 'native')
  return xlmBalance ? parseFloat(xlmBalance.balance) : 0
}

/**
 * Format transaction hash for display
 */
export const formatTransactionHash = (hash: string): string => {
  if (hash.length <= 12) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`
}

/**
 * Get transaction type from operation
 */
export const getTransactionType = (operation: StellarOperation): string => {
  switch (operation.type) {
    case 'payment':
      return 'Payment'
    case 'create_account':
      return 'Account Creation'
    case 'change_trust':
      return 'Trust Change'
    case 'manage_data':
      return 'Data Update'
    case 'set_options':
      return 'Options Update'
    default:
      return operation.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

/**
 * Check if transaction is successful
 */
export const isTransactionSuccessful = (transaction: StellarTransaction): boolean => {
  return transaction.successful
}

/**
 * Get transaction amount from operation
 */
export const getTransactionAmount = (operation: StellarOperation): number => {
  if (operation.amount) {
    return parseFloat(operation.amount)
  }
  if (operation.starting_balance) {
    return parseFloat(operation.starting_balance)
  }
  return 0
}

/**
 * Get transaction asset from operation
 */
export const getTransactionAsset = (operation: StellarOperation): string => {
  if (operation.asset_code) {
    return operation.asset_code
  }
  if (operation.asset_type === 'native') {
    return 'XLM'
  }
  return 'Unknown'
}

/**
 * Format date from Stellar timestamp
 */
export const formatStellarDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get relative time from Stellar timestamp
 */
export const getRelativeTime = (timestamp: string): string => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'agora mesmo'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hora${hours > 1 ? 's' : ''} atrás`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} dia${days > 1 ? 's' : ''} atrás`
  } else {
    return formatStellarDate(timestamp)
  }
}

/**
 * Build Horizon URL with query parameters
 */
export const buildHorizonQuery = (baseUrl: string, params: Record<string, any>): string => {
  const url = new URL(baseUrl, API_CONFIG.STELLAR.HORIZON.BASE_URL)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString())
    }
  })
  
  return url.toString()
}

/**
 * Parse Horizon pagination from response
 */
export const parseHorizonPagination = (response: any): {
  page: number
  limit: number
  total: number
  totalPages: number
} => {
  const records = response._embedded?.records || []
  const limit = parseInt(response._links?.next?.href?.match(/limit=(\d+)/)?.[1] || '10')
  
  return {
    page: 1, // Horizon doesn't provide current page easily
    limit,
    total: records.length, // This is approximate
    totalPages: Math.ceil(records.length / limit)
  }
}

/**
 * Check if account has minimum balance
 */
export const hasMinimumBalance = (account: StellarAccount, minimumBalance: number = 1): boolean => {
  const xlmBalance = getXLMBalance(account.balances)
  return xlmBalance >= minimumBalance
}

/**
 * Get account signer weights
 */
export const getAccountSignerWeights = (account: StellarAccount): {
  low: number
  medium: number
  high: number
} => {
  return {
    low: account.thresholds.low_threshold,
    medium: account.thresholds.med_threshold,
    high: account.thresholds.high_threshold
  }
}

/**
 * Check if account requires auth
 */
export const requiresAuth = (account: StellarAccount): boolean => {
  return account.flags.auth_required
}

/**
 * Get account data attributes
 */
export const getAccountData = (account: StellarAccount): Record<string, string> => {
  return account.data_attr || {}
}

/**
 * Set account data attribute (this would require a transaction)
 */
export const setAccountDataKey = (key: string, value: string): string => {
  // This would be used to build a manage_data operation
  return `manage_data:${key}:${value}`
}

/**
 * Generate random account address (for testing)
 */
export const generateTestAddress = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = 'G' // Start with G for mainnet format
  for (let i = 1; i < 56; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate transaction hash format
 */
export const isValidTransactionHash = (hash: string): boolean => {
  // Stellar transaction hashes are 64 character hex strings
  const hashRegex = /^[a-fA-F0-9]{64}$/
  return hashRegex.test(hash)
}

/**
 * Get network name
 */
export const getNetworkName = (): string => {
  return isTestnet() ? 'Testnet' : 'Mainnet'
}
