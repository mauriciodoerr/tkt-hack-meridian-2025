/**
 * Horizon Client
 * Client for interacting with Stellar Horizon API
 */

import { API_CONFIG, buildHorizonUrl } from './api-config'
// Import types from the original types file
import { 
  User,
  Payment,
  Event,
  EventFilters,
  CreateEventForm,
  LoginForm,
  RegisterForm,
  AuthUser,
  Goal,
  ChartsData,
  DashboardStats,
  DEXPool,
  SwapQuote,
  Notification,
  StellarAccount,
  StellarBalance,
  StellarTransaction,
  StellarOperation,
  HorizonResponse,
  StellarApiResponse,
  PaginatedStellarResponse
} from '../types'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000,  // 5 seconds
  backoffFactor: 2
}

// Calculate delay with exponential backoff
const calculateDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1)
  return Math.min(delay, RETRY_CONFIG.maxDelay)
}

// Horizon API Client class
class HorizonClient {
  private baseURL: string
  private timeout: number

  constructor() {
    this.baseURL = API_CONFIG.STELLAR.HORIZON.BASE_URL
    this.timeout = API_CONFIG.STELLAR.HORIZON.TIMEOUT
    
    console.log('🌐 HorizonClient initialized:', {
      baseURL: this.baseURL,
      timeout: this.timeout
    })
  }

  // Generic request method with retry logic
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<StellarApiResponse<T>> {
    console.log('🚀 Horizon Request:', { endpoint, method: options.method || 'GET' })
    
    const url = buildHorizonUrl(endpoint)
    
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const config: RequestInit = {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: AbortSignal.timeout(this.timeout),
          ...options,
        }

        console.log(`🔄 Tentativa ${attempt}/${RETRY_CONFIG.maxRetries} para ${endpoint}`)
        
        const response = await fetch(url, config)
        
        // Se a resposta não é ok, não faz retry (erro do servidor)
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          return {
            success: false,
            data: null as any,
            error: data.detail || data.title || `HTTP ${response.status}: ${response.statusText}`
          }
        }

        const data = await response.json()
        console.log(`✅ Sucesso na tentativa ${attempt} para ${endpoint}`)
        
        return {
          success: true,
          data: data,
          message: 'Success'
        }
        
      } catch (error) {
        const isLastAttempt = attempt === RETRY_CONFIG.maxRetries
        const errorMessage = error instanceof Error ? error.message : 'Network error'
        
        console.log(`❌ Tentativa ${attempt} falhou para ${endpoint}:`, errorMessage)
        
        // Se é a última tentativa, retorna o erro
        if (isLastAttempt) {
          return {
            success: false,
            data: null as any,
            error: `Falha após ${RETRY_CONFIG.maxRetries} tentativas: ${errorMessage}`
          }
        }
        
        // Se não é a última tentativa, aguarda antes de tentar novamente
        const delayMs = calculateDelay(attempt)
        console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
        await delay(delayMs)
      }
    }
    
    // Fallback (não deveria chegar aqui)
    return {
      success: false,
      data: null as any,
      error: 'Erro inesperado no sistema de retry'
    }
  }

  // Account methods
  async getAccount(accountId: string): Promise<StellarApiResponse<StellarAccount>> {
    return this.request<StellarAccount>(`/accounts/${accountId}`)
  }

  async getAccountBalances(accountId: string): Promise<StellarApiResponse<StellarBalance[]>> {
    const response = await this.getAccount(accountId)
    if (response.success) {
      return {
        success: true,
        data: response.data.balances,
        message: 'Success'
      }
    }
    return {
      success: false,
      data: [],
      error: response.error
    }
  }

  async getAccountTransactions(
    accountId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<StellarApiResponse<PaginatedStellarResponse<StellarTransaction>>> {
    const offset = (page - 1) * limit
    const response = await this.request<HorizonResponse<StellarTransaction>>(
      `/accounts/${accountId}/transactions?limit=${limit}&order=desc`
    )
    
    if (response.success) {
      const transactions = response.data._embedded.records
      const total = transactions.length // Horizon doesn't provide total count easily
      
      return {
        success: true,
        data: {
          data: transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: 'Success'
      }
    }
    
    return {
      success: false,
      data: {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      },
      error: response.error
    }
  }

  async getAccountOperations(
    accountId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<StellarApiResponse<PaginatedStellarResponse<StellarOperation>>> {
    const offset = (page - 1) * limit
    const response = await this.request<HorizonResponse<StellarOperation>>(
      `/accounts/${accountId}/operations?limit=${limit}&order=desc`
    )
    
    if (response.success) {
      const operations = response.data._embedded.records
      const total = operations.length
      
      return {
        success: true,
        data: {
          data: operations,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: 'Success'
      }
    }
    
    return {
      success: false,
      data: {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      },
      error: response.error
    }
  }

  // Payment methods
  async getAccountPayments(
    accountId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<StellarApiResponse<PaginatedStellarResponse<StellarOperation>>> {
    const response = await this.request<HorizonResponse<StellarOperation>>(
      `/accounts/${accountId}/payments?limit=${limit}&order=desc`
    )
    
    if (response.success) {
      const payments = response.data._embedded.records
      const total = payments.length
      
      return {
        success: true,
        data: {
          data: payments,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: 'Success'
      }
    }
    
    return {
      success: false,
      data: {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      },
      error: response.error
    }
  }

  // Transaction methods
  async getTransaction(transactionHash: string): Promise<StellarApiResponse<StellarTransaction>> {
    return this.request<StellarTransaction>(`/transactions/${transactionHash}`)
  }

  async getTransactionOperations(transactionHash: string): Promise<StellarApiResponse<StellarOperation[]>> {
    const response = await this.request<HorizonResponse<StellarOperation>>(
      `/transactions/${transactionHash}/operations`
    )
    
    if (response.success) {
      return {
        success: true,
        data: response.data._embedded.records,
        message: 'Success'
      }
    }
    
    return {
      success: false,
      data: [],
      error: response.error
    }
  }

  // Ledger methods
  async getLatestLedger(): Promise<StellarApiResponse<any>> {
    return this.request<any>('/ledgers?order=desc&limit=1')
  }

  // Asset methods
  async getAssets(page: number = 1, limit: number = 10): Promise<StellarApiResponse<PaginatedStellarResponse<any>>> {
    const response = await this.request<HorizonResponse<any>>(
      `/assets?limit=${limit}&order=desc`
    )
    
    if (response.success) {
      const assets = response.data._embedded.records
      const total = assets.length
      
      return {
        success: true,
        data: {
          data: assets,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: 'Success'
      }
    }
    
    return {
      success: false,
      data: {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      },
      error: response.error
    }
  }

  // Helper methods for data transformation
  async getUserProfile(accountId: string): Promise<StellarApiResponse<User>> {
    try {
      const [accountResponse, balancesResponse] = await Promise.all([
        this.getAccount(accountId),
        this.getAccountBalances(accountId)
      ])

      if (!accountResponse.success) {
        return {
          success: false,
          data: null as any,
          error: accountResponse.error
        }
      }

      const account = accountResponse.data
      const balances = balancesResponse.success ? balancesResponse.data : []

      // Find TKT token balance
      const tktBalance = balances.find(b => 
        b.asset_code === 'TKT' || b.asset_type === 'native'
      )?.balance || '0'

      // Find native XLM balance
      const xlmBalance = balances.find(b => b.asset_type === 'native')?.balance || '0'

      const user: User = {
        id: accountId,
        name: account.data_attr?.name || 'Unknown User',
        email: account.data_attr?.email || '',
        avatar: account.data_attr?.avatar,
        balance: parseFloat(xlmBalance),
        tktBalance: parseFloat(tktBalance),
        joinedAt: new Date().toISOString(), // Horizon doesn't provide creation date
        isVerified: true // Assume verified for now
      }

      return {
        success: true,
        data: user,
        message: 'Success'
      }
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : 'Failed to get user profile'
      }
    }
  }

  async getUserTransactions(
    accountId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<StellarApiResponse<PaginatedStellarResponse<Payment>>> {
    try {
      const response = await this.getAccountOperations(accountId, page, limit)
      
      if (!response.success) {
        return {
          success: false,
          data: {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0
            }
          },
          error: response.error
        }
      }

      const operations = response.data.data
      const payments: Payment[] = operations
        .filter(op => op.type === 'payment' || op.type === 'create_account')
        .map(op => ({
          id: op.id,
          type: op.type === 'create_account' ? 'purchase' : 'transfer',
          amount: parseFloat(op.amount || '0'),
          tktAmount: parseFloat(op.amount || '0'),
          status: op.transaction_successful ? 'completed' : 'failed',
          timestamp: op.created_at,
          description: `${op.type} operation`,
          senderId: op.from || op.source_account,
          recipientId: op.to || op.account,
          hash: op.transaction_hash,
          ledger: parseInt(op.id.split('-')[0]) // Extract ledger from operation ID
        }))

      return {
        success: true,
        data: {
          data: payments,
          pagination: response.data.pagination
        },
        message: 'Success'
      }
    } catch (error) {
      return {
        success: false,
        data: {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        },
        error: error instanceof Error ? error.message : 'Failed to get user transactions'
      }
    }
  }
}

// Export singleton instance
export const horizonClient = new HorizonClient()

// Export individual methods for easier testing
export const {
  getAccount,
  getAccountBalances,
  getAccountTransactions,
  getAccountOperations,
  getAccountPayments,
  getTransaction,
  getTransactionOperations,
  getLatestLedger,
  getAssets,
  getUserProfile,
  getUserTransactions
} = horizonClient
