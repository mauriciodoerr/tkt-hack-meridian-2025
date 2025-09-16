/**
 * EventCoin Mock Data
 * Centralized mock data for all components
 * Following the pattern from DeFi Risk Guardian
 */

import { Event, Notification, User, Payment, DEXPool } from '../types'

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Daniel Roger Gorgonha',
    email: 'rogergorgonha@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    balance: 1250.50,
    tktBalance: 12505,
    joinedAt: '2024-01-15T10:00:00Z',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    balance: 850.25,
    tktBalance: 8502,
    joinedAt: '2024-02-20T14:30:00Z',
    isVerified: true,
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    balance: 2100.75,
    tktBalance: 21007,
    joinedAt: '2024-01-10T09:15:00Z',
    isVerified: false,
  },
]

// Mock Events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Música Eletrônica',
    description: 'O maior festival de música eletrônica da cidade com os melhores DJs nacionais e internacionais.',
    date: '15 de Dezembro, 2024',
    time: '19:00 - 23:00',
    location: 'Parque Ibirapuera, São Paulo',
    attendees: 1250,
    maxAttendees: 2000,
    price: 150.00,
    status: 'active',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&h=300&fit=crop',
    organizer: 'Bootcamps SUI',
    category: 'Música',
    requiresApproval: false,
    ticketBatches: [
      {
        id: 'batch-1',
        name: 'Lote 1 - Early Bird',
        price: 0,
        description: 'Ingresso gratuito para os primeiros participantes',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'sold-out'
      },
      {
        id: 'batch-2',
        name: 'Lote 2 - Regular',
        price: 150,
        description: 'Ingresso regular com acesso completo ao evento',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'available'
      }
    ]
  },
  {
    id: '2',
    title: 'Workshop de Blockchain',
    description: 'Aprenda sobre blockchain, DeFi e Web3 com especialistas da área.',
    date: '20 de Dezembro, 2024',
    time: '19:00 - 20:00',
    location: 'Centro de Convenções, Rio de Janeiro',
    attendees: 45,
    maxAttendees: 100,
    price: 75.00,
    status: 'active',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop',
    organizer: 'EventCoin',
    category: 'Tecnologia',
    requiresApproval: true,
    ticketBatches: [
      {
        id: 'batch-1',
        name: 'Lote 1 - Early Bird',
        price: 0,
        description: 'Ingresso gratuito para os primeiros participantes',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'sold-out'
      },
      {
        id: 'batch-2',
        name: 'Lote 2 - Regular',
        price: 75,
        description: 'Ingresso regular com acesso completo ao evento',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'sold-out'
      },
      {
        id: 'batch-3',
        name: 'Lote 3 - Última Chance',
        price: 100,
        description: 'Ingresso premium com benefícios exclusivos',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: true,
        status: 'available'
      }
    ]
  },
  {
    id: '3',
    title: 'Conferência de Tecnologia',
    description: 'Evento sobre as últimas tendências em tecnologia e inovação.',
    date: '25 de Dezembro, 2024',
    time: '19:00 - 20:00',
    location: 'Auditório Principal, Belo Horizonte',
    attendees: 200,
    maxAttendees: 200,
    price: 120.00,
    status: 'sold-out',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop',
    organizer: 'Tech Conference',
    category: 'Tecnologia',
    requiresApproval: false,
    ticketBatches: [
      {
        id: 'batch-1',
        name: 'Lote 1 - Early Bird',
        price: 0,
        description: 'Ingresso gratuito para os primeiros participantes',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'sold-out'
      },
      {
        id: 'batch-2',
        name: 'Lote 2 - Regular',
        price: 120,
        description: 'Ingresso regular com acesso completo ao evento',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'sold-out'
      }
    ]
  },
  {
    id: '4',
    title: 'Sui Bootcamp I Brasil',
    description: 'Bootcamp completo sobre a blockchain Sui e desenvolvimento Move.',
    date: '1 de Setembro, 2024',
    time: '19:00 - 20:00',
    location: 'Online - Zoom',
    attendees: 376,
    maxAttendees: 500,
    price: 0,
    status: 'live',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=300&fit=crop',
    organizer: 'WayLearn & Sui Brasil',
    category: 'Educação',
    requiresApproval: false,
    ticketBatches: [
      {
        id: 'batch-1',
        name: 'Lote 1 - Early Bird',
        price: 0,
        description: 'Ingresso gratuito para os primeiros participantes',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'available'
      }
    ]
  },
  {
    id: '5',
    title: 'Sunset with Stellar Ambassadors',
    description: 'Evento exclusivo com embaixadores da Stellar para networking e aprendizado.',
    date: '16 de Setembro, 2024',
    time: '17:00 - 19:00',
    location: 'Via 11',
    attendees: 294,
    maxAttendees: 300,
    price: 50.00,
    status: 'active',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    organizer: 'Stellar Brazil, Caio Mattos, Lau e Bastian Koh',
    category: 'Networking',
    requiresApproval: true,
    ticketBatches: [
      {
        id: 'batch-1',
        name: 'Lote 1 - Early Bird',
        price: 0,
        description: 'Ingresso gratuito para os primeiros participantes',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'sold-out'
      },
      {
        id: 'batch-2',
        name: 'Lote 2 - Regular',
        price: 50,
        description: 'Ingresso regular com acesso completo ao evento',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: true,
        status: 'available'
      }
    ]
  },
  {
    id: '6',
    title: 'CryptoLar x Starknet: O Hackathon - Ato I',
    description: 'Hackathon focado em desenvolvimento na rede Starknet com prêmios em dinheiro.',
    date: '27 de Setembro, 2024',
    time: '13:30 - 18:00',
    location: 'R. Lauro Linhares, 2010',
    attendees: 46,
    maxAttendees: 100,
    price: 0,
    status: 'active',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
    organizer: 'Alexandre Melo & Starknet Foundation',
    category: 'Hackathon',
    requiresApproval: false,
    ticketBatches: [
      {
        id: 'batch-1',
        name: 'Lote 1 - Early Bird',
        price: 0,
        description: 'Ingresso gratuito para os primeiros participantes',
        availableUntil: '26 de nov., 10:20',
        requiresApproval: false,
        status: 'available'
      }
    ]
  }
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Meta de eventos atingida!',
    message: 'Você participou de 8 eventos este mês!',
    timestamp: '2 horas atrás',
    read: false,
    action: { label: 'Ver eventos', onClick: () => console.log('Ver eventos') }
  },
  {
    id: '2',
    type: 'warning',
    title: 'Saldo TKT baixo',
    message: 'Seu saldo está abaixo de 100 TKT',
    timestamp: '1 dia atrás',
    read: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Novo evento disponível',
    message: 'Festival de Música 2024 está disponível',
    timestamp: '2 dias atrás',
    read: true
  },
  {
    id: '4',
    type: 'success',
    title: 'Desconto especial!',
    message: 'Você ganhou 10% de desconto no próximo evento',
    timestamp: '3 dias atrás',
    read: false
  },
  {
    id: '5',
    type: 'info',
    title: 'Evento aprovado',
    message: 'Sua inscrição no Workshop de Blockchain foi aprovada',
    timestamp: '1 semana atrás',
    read: true
  }
]

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: '1',
    type: 'purchase',
    amount: 150.00,
    tktAmount: 1500,
    status: 'completed',
    timestamp: '2024-12-01T10:30:00Z',
    description: 'Compra de tokens TKT',
    eventId: '1'
  },
  {
    id: '2',
    type: 'transfer',
    amount: 50.00,
    tktAmount: 500,
    status: 'completed',
    timestamp: '2024-11-28T15:45:00Z',
    description: 'Transferência P2P para Maria Silva',
    eventId: null
  },
  {
    id: '3',
    type: 'event_payment',
    amount: 75.00,
    tktAmount: 750,
    status: 'completed',
    timestamp: '2024-11-25T09:20:00Z',
    description: 'Pagamento Workshop de Blockchain',
    eventId: '2'
  }
]

// Mock DEX Pools
export const mockDEXPools: DEXPool[] = [
  {
    id: '1',
    name: 'TKT/USDC',
    tokenA: 'TKT',
    tokenB: 'USDC',
    liquidity: 125000,
    volume24h: 15000,
    apy: 12.5,
    fee: 0.3
  },
  {
    id: '2',
    name: 'TKT/XLM',
    tokenA: 'TKT',
    tokenB: 'XLM',
    liquidity: 85000,
    volume24h: 8500,
    apy: 8.7,
    fee: 0.3
  },
  {
    id: '3',
    name: 'TKT/BRL',
    tokenA: 'TKT',
    tokenB: 'BRL',
    liquidity: 200000,
    volume24h: 25000,
    apy: 15.2,
    fee: 0.3
  }
]

// Mock Dashboard Stats
export const mockDashboardStats = {
  totalEvents: 156,
  totalUsers: 2847,
  totalRevenue: 125000,
  activeEvents: 23,
  upcomingEvents: 12,
  completedEvents: 121,
  userStats: {
    totalParticipants: 2847,
    newUsersThisMonth: 234,
    activeUsers: 1856,
    averageEventsPerUser: 3.2
  },
  eventStats: {
    totalEvents: 156,
    averageRating: 4.7,
    totalParticipants: 12543,
    averagePrice: 85.50
  },
  paymentStats: {
    totalVolume: 125000,
    totalTransactions: 3456,
    averageTransaction: 36.20,
    tktInCirculation: 1250000
  }
}
