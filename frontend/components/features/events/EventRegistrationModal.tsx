'use client'

import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui'
import { 
  X, 
  Check, 
  Clock, 
  User, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Users
} from 'lucide-react'

interface TicketBatch {
  id: string
  name: string
  price: number
  description?: string
  availableUntil?: string
  requiresApproval: boolean
  status: 'available' | 'sold-out' | 'upcoming'
  availableFrom?: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  attendees: number
  maxAttendees: number
  price: number
  status: 'active' | 'sold-out' | 'upcoming' | 'live'
  rating: number
  image: string
  ticketBatches?: TicketBatch[]
  requiresApproval?: boolean
}

interface EventRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onRegister: (eventId: string, ticketBatchId: string) => void
}

export function EventRegistrationModal({ 
  isOpen, 
  onClose, 
  event, 
  onRegister 
}: EventRegistrationModalProps) {
  const [selectedTicketBatch, setSelectedTicketBatch] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  if (!event) return null

  // Mock data para lotes de ingressos
  const ticketBatches: TicketBatch[] = event.ticketBatches || [
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

  const handleRegister = async () => {
    if (!selectedTicketBatch) return

    setIsRegistering(true)
    
    // Simular processo de inscrição
    setTimeout(() => {
      onRegister(event.id, selectedTicketBatch)
      setIsRegistering(false)
      onClose()
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'sold-out':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível'
      case 'sold-out':
        return 'Esgotado'
      case 'upcoming':
        return 'Em Breve'
      default:
        return 'Indisponível'
    }
  }

  const selectedBatch = ticketBatches.find(batch => batch.id === selectedTicketBatch)
  const hasAvailableTickets = ticketBatches.some(batch => batch.status === 'available')

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Obter Ingressos</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-400 mt-1 text-center text-sm">
              Escolha o tipo de ingresso:
            </p>
          </div>
        </div>

        {/* Approval Notice */}
        {event.requiresApproval && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Aprovação Necessária</h3>
                <p className="text-gray-400 text-xs">
                  Inscrição sujeita à aprovação.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Batches */}
        <div className="space-y-3 mb-4">
          {ticketBatches.map((batch) => (
            <div
              key={batch.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedTicketBatch === batch.id
                  ? 'bg-white/10 border-primary-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              } ${batch.status === 'sold-out' ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => batch.status !== 'sold-out' && setSelectedTicketBatch(batch.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  {batch.status === 'sold-out' ? (
                    <div className="w-4 h-4 rounded-full bg-gray-600 border-2 border-gray-500 mt-1"></div>
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                      selectedTicketBatch === batch.id
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedTicketBatch === batch.id && (
                        <Check className="w-2 h-2 text-white" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-base">{batch.name}</h3>
                    {batch.description && (
                      <p className="text-gray-400 text-xs mt-1">{batch.description}</p>
                    )}
                    
                    {batch.availableUntil && (
                      <div className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Até {batch.availableUntil}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.status)}`}>
                    {getStatusText(batch.status)}
                  </span>
                  
                  <div className="text-right">
                    <div className="text-white font-bold text-base">
                      {batch.price === 0 ? 'Grátis' : `R$ ${batch.price.toFixed(2)}`}
                    </div>
                    {batch.requiresApproval && (
                      <div className="text-xs text-yellow-400 mt-1">Aprovação</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Tickets Available */}
        {!hasAvailableTickets && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Ingressos Esgotados</h3>
                <p className="text-gray-400 text-xs">
                  Nenhum ingresso disponível no momento.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Information */}
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-orange-400 text-xs">😊</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Daniel Roger Gorgonha</p>
              <p className="text-gray-400 text-xs">rogergorgonha@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Registration Button */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleRegister}
            disabled={!selectedTicketBatch || !hasAvailableTickets || isRegistering}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            {isRegistering ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              'Solicitar'
            )}
          </Button>
        </div>

        {/* Event Details Summary */}
        <div className="bg-white/5 rounded-lg p-3">
          <h3 className="text-white font-semibold mb-3 text-sm">Resumo</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{event.date}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Users className="w-3 h-3" />
              <span className="text-xs">{event.attendees}/{event.maxAttendees}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs">
                {selectedBatch ? (
                  selectedBatch.price === 0 ? 'Gratuito' : `R$ ${selectedBatch.price.toFixed(2)}`
                ) : (
                  'Selecione'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
