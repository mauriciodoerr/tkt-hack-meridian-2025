'use client'

import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui'
import { Calendar, MapPin, Users, DollarSign, Star, Clock, X, Share2, Heart } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  attendees: number
  maxAttendees: number
  price: number
  status: 'active' | 'sold-out' | 'upcoming'
  rating: number
  image: string
}

interface EventDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onJoin: (eventId: string) => void
}

export function EventDetailsModal({ isOpen, onClose, event, onJoin }: EventDetailsModalProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  if (!event) return null

  const handleJoinEvent = async () => {
    setIsJoining(true)
    
    // Simular processo de participação
    setTimeout(() => {
      onJoin(event.id)
      setIsJoining(false)
    }, 1500)
  }

  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      })
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
    // Aqui seria feita a integração com o backend
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
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
      case 'active':
        return 'Ativo'
      case 'sold-out':
        return 'Esgotado'
      case 'upcoming':
        return 'Em Breve'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">{event.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorited 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShareEvent}
              className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 object-cover rounded-2xl"
              />
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="flex items-center space-x-1 text-white">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span className="text-sm font-medium">{event.rating}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Sobre o Evento</h3>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">Data</span>
                </div>
                <p className="text-gray-300">{event.date}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">Local</span>
                </div>
                <p className="text-gray-300">{event.location}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">Participantes</span>
                </div>
                <p className="text-gray-300">
                  {event.attendees}/{event.maxAttendees} pessoas
                </p>
                <div className="mt-2 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">Preço</span>
                </div>
                <p className="text-gray-300">
                  {event.price === 0 ? 'Gratuito' : `R$ ${event.price.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Event Card */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {event.price === 0 ? 'Gratuito' : `R$ ${event.price.toFixed(2)}`}
                </div>
                <p className="text-gray-400">por participante</p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleJoinEvent}
                  disabled={event.status === 'sold-out' || isJoining}
                  className="w-full"
                  size="lg"
                >
                  {isJoining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : event.status === 'sold-out' ? (
                    'Esgotado'
                  ) : (
                    'Participar do Evento'
                  )}
                </Button>

                {event.status === 'active' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShareEvent}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Vagas restantes</span>
                  <span className="text-white font-medium">
                    {event.maxAttendees - event.attendees}
                  </span>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Organizador</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-400 font-semibold">EC</span>
                </div>
                <div>
                  <p className="text-white font-medium">EventCoin Team</p>
                  <p className="text-gray-400 text-sm">Organizador Verificado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
