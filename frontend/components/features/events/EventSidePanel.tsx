'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../ui'
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Star, 
  Clock, 
  X, 
  Share2, 
  Heart,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Copy,
  Video,
  UserPlus,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { EventRegistrationModal } from './EventRegistrationModal'
import { InviteFriendModal } from './InviteFriendModal'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  attendees: number
  maxAttendees: number
  price: number
  status: 'active' | 'sold-out' | 'upcoming' | 'live' | 'completed' | 'cancelled'
  rating: number
  image: string
}

interface EventSidePanelProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  events: Event[]
  currentIndex: number
  onNavigateEvent: (index: number) => void
  onJoin: (eventId: string) => void
  onGoToEventPage: (eventId: string) => void
}

export function EventSidePanel({ 
  isOpen, 
  onClose, 
  event, 
  events, 
  currentIndex, 
  onNavigateEvent,
  onJoin,
  onGoToEventPage 
}: EventSidePanelProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isParticipating, setIsParticipating] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)

  useEffect(() => {
    if (event) {
      // Resetar estados ao mudar de evento
      setIsJoining(false)
      setIsFavorited(false)
      setShowInviteModal(false)
      setShowRegistrationModal(false)
      
      // Simular dados baseados no ID do evento para consistência
      const eventId = parseInt(event.id)
      setIsParticipating(eventId % 2 === 0)
      setApprovalStatus(eventId % 3 === 0 ? 'pending' : null)
    }
  }, [event])

  if (!event) return null

  const handleJoinEvent = async () => {
    // Abrir modal de inscrição em vez de participar diretamente
    setShowRegistrationModal(true)
  }

  const handleRegister = (eventId: string, ticketBatchId: string) => {
    // Simular processo de inscrição
    console.log('Inscrição realizada:', { eventId, ticketBatchId })
    setIsParticipating(true)
    setApprovalStatus('pending')
    setShowRegistrationModal(false)
  }

  const handleAddToCalendar = () => {
    // Simular adição ao calendário
    console.log('Adicionando ao calendário:', event.title)
    alert('Evento adicionado ao seu calendário!')
  }

  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copiado!')
  }

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleNavigateUp = () => {
    if (currentIndex > 0) {
      // Fechar modais antes de navegar
      setShowInviteModal(false)
      setShowRegistrationModal(false)
      onNavigateEvent(currentIndex - 1)
    }
  }

  const handleNavigateDown = () => {
    if (currentIndex < events.length - 1) {
      // Fechar modais antes de navegar
      setShowInviteModal(false)
      setShowRegistrationModal(false)
      onNavigateEvent(currentIndex + 1)
    }
  }

  const handleGoToEventPage = () => {
    onGoToEventPage(event.id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'sold-out':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'live':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'cancelled':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'sold-out':
        return 'Esgotado'
      case 'upcoming':
        return 'Em Breve'
      case 'live':
        return 'AO VIVO'
      case 'completed':
        return 'Finalizado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-dark-900 border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-colors"
                title="Copiar Link"
              >
                <Copy className="w-4 h-4" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToEventPage}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Página do Evento
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleNavigateUp}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Evento Anterior"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleNavigateDown}
                disabled={currentIndex === events.length - 1}
                className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Próximo Evento"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-modal">
            <div className="p-3 sm:p-4 pb-6 space-y-3 sm:space-y-4 min-h-full">
              {/* Event Banner */}
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg sm:rounded-xl"
                />
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col sm:flex-row items-end space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3">
                    <div className="flex items-center space-x-1 text-white">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-yellow-400" />
                      <span className="text-xs sm:text-sm font-medium">{event.rating}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>
              </div>

              {/* Event Title */}
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white mb-1">{event.title}</h1>
                <div className="flex items-center space-x-2 text-gray-400">
                  <span className="text-xs">Bootcamps SUI</span>
                  <span>•</span>
                  <span className="text-xs">EventCoin</span>
                </div>
              </div>

              {/* Event Schedule */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary-400" />
                  <span className="text-white font-medium text-sm">Cronograma</span>
                </div>
                <div className="text-gray-300">
                  <p className="font-medium text-sm">{event.date}</p>
                  <p className="text-xs">19:00 - 20:00 BRT</p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Video className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">Zoom</span>
                </div>
              </div>

              {/* Participation Status */}
              {approvalStatus === 'pending' ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 text-sm">😊</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm">Aprovação Pendente</h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Avisaremos quando aprovado.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Começando em</div>
                      <div className="text-white font-semibold text-sm">4d 12h</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm py-2"
                      onClick={handleAddToCalendar}
                    >
                      <Calendar className="w-3 h-3 mr-2" />
                      Adicionar ao Calendário
                    </Button>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-sm py-2"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="w-3 h-3 mr-2" />
                      Convide um Amigo
                      <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">+10 TKT</span>
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      Não pode mais comparecer?{' '}
                      <button className="text-pink-400 hover:text-pink-300 underline">
                        Cancele sua inscrição
                      </button>
                    </p>
                  </div>
                </div>
              ) : isParticipating ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-sm">😊</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Você está dentro</h3>
                      {event.status === 'live' && (
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-400 text-xs font-medium">• AO VIVO</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleJoinEvent}
                      className="w-full text-sm py-2"
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Video className="w-3 h-3 mr-2" />
                          Participar do Evento
                        </>
                      )}
                    </Button>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-sm py-2"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="w-3 h-3 mr-2" />
                      Convide um Amigo
                      <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">+10 TKT</span>
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      Não pode mais comparecer?{' '}
                      <button className="text-pink-400 hover:text-pink-300 underline">
                        Cancele sua inscrição
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-center mb-3">
                    <div className="text-xl font-bold text-white mb-1">
                      {event.price === 0 ? 'Gratuito' : `R$ ${event.price.toFixed(2)}`}
                    </div>
                    <p className="text-gray-400 text-xs">por participante</p>
                  </div>

                  <Button
                    onClick={handleJoinEvent}
                    disabled={event.status === 'sold-out' || isJoining}
                    className="w-full text-sm py-2"
                  >
                    {isJoining ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Processando...
                      </>
                    ) : event.status === 'sold-out' ? (
                      'Esgotado'
                    ) : (
                      'Inscrever-se'
                    )}
                  </Button>
                </div>
              )}

              {/* Prepare for Event */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">Prepare-se para o Evento</h3>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <span className="text-primary-400 text-xs">👤</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-xs">Seu Perfil</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-primary-400 text-xs">👤</span>
                      <p className="text-white text-xs">Daniel Roger Gorgon...</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs py-1">
                      Atualizar Perfil
                    </Button>
                  </div>

                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-3 h-3 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-xs">Configurar Lembretes</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">E-mail</span>
                        <div className="w-6 h-3 bg-green-500 rounded-full relative">
                          <div className="w-2 h-2 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">WhatsApp</span>
                        <div className="w-6 h-3 bg-gray-600 rounded-full relative">
                          <div className="w-2 h-2 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Event */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <h3 className="text-white font-semibold mb-2 text-sm">Sobre o Evento</h3>
                <p className="text-gray-300 leading-relaxed text-sm">{event.description}</p>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary-400" />
                    <span className="text-white font-medium text-sm">Local</span>
                  </div>
                  <p className="text-gray-300 text-sm">{event.location}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-primary-400" />
                    <span className="text-white font-medium text-sm">Participantes</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {event.attendees}/{event.maxAttendees}
                  </p>
                  <div className="mt-2 bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteFriendModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        event={event}
      />

      {/* Registration Modal */}
      <EventRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        event={event}
        onRegister={handleRegister}
      />
    </>
  )
}

