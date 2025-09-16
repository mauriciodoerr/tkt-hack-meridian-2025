import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui'
import { Calendar, MapPin, Users, Clock, Star } from 'lucide-react'

interface EventCardProps {
  event: {
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
    image?: string
  }
  onClick?: (eventId: string) => void
}

export function EventCard({ event, onClick }: EventCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'live':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'cancelled':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'sold-out':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'upcoming':
        return 'Em Breve'
      case 'live':
        return 'Ao Vivo'
      case 'completed':
        return 'Finalizado'
      case 'cancelled':
        return 'Cancelado'
      case 'sold-out':
        return 'Esgotado'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <Card 
      variant="premium" 
      className="group hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={() => onClick?.(event.id)}
    >
      <CardHeader className="p-0">
        <div className="relative">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover rounded-t-2xl"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-t-2xl flex items-center justify-center">
              <Calendar className="w-16 h-16 text-primary-400" />
            </div>
          )}
          
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </span>
          </div>
          
          <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm font-medium">{event.rating}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-xl text-white mb-2">{event.title}</CardTitle>
            <CardDescription className="text-gray-300 line-clamp-2">
              {event.description}
            </CardDescription>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{event.date}</span>
            </div>
            
            <div className="flex items-center text-gray-400">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{event.location}</span>
            </div>
            
            <div className="flex items-center text-gray-400">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {event.attendees}/{event.maxAttendees} participantes
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="text-2xl font-bold text-white">
              {event.price === 0 ? 'Grátis' : `R$ ${event.price.toFixed(2)}`}
            </div>
            
            <div className="text-sm text-gray-400 group-hover:text-white transition-colors">
              Clique para ver detalhes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
