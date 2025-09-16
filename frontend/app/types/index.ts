/**
 * EventCoin Types
 * Centralized type definitions for the application
 */

// User Types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  balance: number
  tktBalance: number
  joinedAt: string
  isVerified: boolean
}

// Event Types
export interface TicketBatch {
  id: string
  name: string
  price: number
  description?: string
  availableUntil?: string
  requiresApproval: boolean
  status: 'available' | 'sold-out' | 'upcoming'
  availableFrom?: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time?: string
  location: string
  attendees: number
  maxAttendees: number
  price: number
  status: 'active' | 'sold-out' | 'upcoming' | 'live' | 'completed' | 'cancelled'
  rating: number
  image: string
  organizer: string
  category: string
  requiresApproval?: boolean
  ticketBatches?: TicketBatch[]
  createdAt?: string
  updatedAt?: string
  // Contract-specific fields
  feeRate?: number
  totalVolume?: number
  totalVolumeStroops?: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Payment Types
export interface Payment {
  id: string
  type: 'purchase' | 'transfer' | 'event_payment' | 'withdrawal'
  amount: number
  tktAmount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  timestamp: string
  description: string
  eventId?: string | null
  recipientId?: string
  senderId?: string
}

// DEX Types
export interface DEXPool {
  id: string
  name: string
  tokenA: string
  tokenB: string
  liquidity: number
  volume24h: number
  apy: number
  fee: number
}

export interface SwapQuote {
  inputAmount: number
  outputAmount: number
  priceImpact: number
  fee: number
  route: string[]
}

// Stellar Network Types
export interface StellarAccount {
  id: string
  account_id: string
  sequence: string
  balances: StellarBalance[]
  data_attr?: Record<string, string>
  flags: {
    auth_required: boolean
    auth_revocable: boolean
    auth_immutable: boolean
  }
  signers: StellarSigner[]
  thresholds: {
    low_threshold: number
    med_threshold: number
    high_threshold: number
  }
}

export interface StellarBalance {
  balance: string
  limit?: string
  asset_type: string
  asset_code?: string
  asset_issuer?: string
  buying_liabilities?: string
  selling_liabilities?: string
  last_modified_ledger?: number
  is_authorized?: boolean
  is_authorized_to_maintain_liabilities?: boolean
  is_clawback_enabled?: boolean
}

export interface StellarSigner {
  weight: number
  key: string
  type: string
}

export interface StellarTransaction {
  id: string
  paging_token: string
  successful: boolean
  hash: string
  ledger: number
  created_at: string
  source_account: string
  source_account_sequence: string
  fee_account?: string
  fee_charged: string
  max_fee: string
  operation_count: number
  envelope_xdr: string
  result_xdr: string
  result_meta_xdr: string
  fee_meta_xdr: string
  memo_type: string
  memo?: string
  signatures: string[]
  valid_after?: string
  valid_before?: string
}

export interface StellarOperation {
  id: string
  paging_token: string
  transaction_successful: boolean
  source_account: string
  type: string
  type_i: number
  created_at: string
  transaction_hash: string
  asset_type?: string
  asset_code?: string
  asset_issuer?: string
  from?: string
  to?: string
  amount?: string
  starting_balance?: string
  funder?: string
  account?: string
  trustor?: string
  trustee?: string
  limit?: string
  asset?: {
    asset_type: string
    asset_code?: string
    asset_issuer?: string
  }
  authorize?: boolean
  authorize_to_maintain_liabilities?: boolean
  clawback_enabled?: boolean
}

// Horizon API Response Types
export interface HorizonResponse<T> {
  _links: {
    self: { href: string }
    next?: { href: string }
    prev?: { href: string }
  }
  _embedded: {
    records: T[]
  }
}

// API Response Types
export interface StellarApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedStellarResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter Types
export interface EventFilters {
  dateRange?: string
  location?: string
  priceRange?: string
  attendees?: string
  rating?: string
  categories?: string[]
  category?: string
  status?: string
  search?: string
}

// Dashboard Types
export interface DashboardStats {
  totalEvents: number
  totalUsers: number
  totalRevenue: number
  activeEvents: number
  upcomingEvents: number
  completedEvents: number
  userStats: {
    totalParticipants: number
    newUsersThisMonth: number
    activeUsers: number
    averageEventsPerUser: number
  }
  eventStats: {
    totalEvents: number
    averageRating: number
    totalParticipants: number
    averagePrice: number
  }
  paymentStats: {
    totalVolume: number
    totalTransactions: number
    averageTransaction: number
    tktInCirculation: number
  }
}

// Form Types
export interface CreateEventForm {
  title: string
  description: string
  date: string
  time: string
  location: string
  maxAttendees: number
  price: number
  category: string
  requiresApproval: boolean
  image?: string
}

export interface UserProfileForm {
  name: string
  email: string
  avatar?: string
}

// Auth Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  token: string
  refreshToken: string
}

// Goals Types
export interface Goal {
  id: string
  title: string
  target: number
  current: number
  type: 'events' | 'savings' | 'social' | 'revenue'
  deadline: string
  completed: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

// Charts Types
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface SpendingByCategory {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface ChartsData {
  balanceHistory: ChartDataPoint[]
  spendingByCategory: SpendingByCategory[]
  eventsOverTime: ChartDataPoint[]
  revenueOverTime: ChartDataPoint[]
}

// Component Props Types
export interface EventSidePanelProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  events: Event[]
  currentIndex: number
  onNavigateEvent: (index: number) => void
  onJoin: (eventId: string) => void
  onGoToEventPage: (eventId: string) => void
}

export interface EventRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onRegister: (eventId: string, ticketBatchId: string) => void
}

export interface InviteFriendModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
    description: string
  }
}

export interface NotificationBellProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onDismiss?: (id: string) => void
  onMarkAllAsRead?: () => void
}
