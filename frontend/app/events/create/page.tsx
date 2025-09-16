'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui'
import { Navbar } from '../../../components/layout/Navbar'
import { TicketConfigurationModal } from '../../../components/features/events/TicketConfigurationModal'
import { CapacityConfigurationModal } from '../../../components/features/events/CapacityConfigurationModal'
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Globe, 
  Lock, 
  Clock,
  Image as ImageIcon,
  Sparkles,
  Settings,
  Ticket,
  UserCheck,
  Hash
} from 'lucide-react'

interface EventFormData {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  timezone: string
  location: string
  locationType: 'physical' | 'virtual'
  virtualLink: string
  visibility: 'public' | 'private'
  calendar: string
  theme: string
  requiresApproval: boolean
  capacity: number | null
  isFree: boolean
  price: number
  currency: string
  ticketBatches: Array<{
    id: string
    name: string
    price: number
    description: string
    availableUntil: string
    requiresApproval: boolean
    status: 'available' | 'sold_out'
  }>
}

const themes = [
  { id: 'minimal', name: 'Minimalista', preview: 'bg-gradient-to-br from-gray-100 to-gray-200' },
  { id: 'tech', name: 'Tecnologia', preview: 'bg-gradient-to-br from-blue-500 to-purple-600' },
  { id: 'business', name: 'Negócios', preview: 'bg-gradient-to-br from-green-500 to-blue-500' },
  { id: 'creative', name: 'Criativo', preview: 'bg-gradient-to-br from-pink-500 to-orange-500' },
  { id: 'nature', name: 'Natureza', preview: 'bg-gradient-to-br from-green-400 to-emerald-600' }
]

const calendars = [
  { id: 'personal', name: 'Calendário Pessoal', icon: '📅' },
  { id: 'work', name: 'Calendário de Trabalho', icon: '💼' },
  { id: 'events', name: 'Eventos', icon: '🎉' }
]

export default function CreateEventPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'America/Sao_Paulo',
    location: '',
    locationType: 'physical',
    virtualLink: '',
    visibility: 'public',
    calendar: 'personal',
    theme: 'minimal',
    requiresApproval: false,
    capacity: null,
    isFree: true,
    price: 0,
    currency: 'TKT',
    ticketBatches: [
      {
        id: 'batch-1',
        name: 'Lote 1',
        price: 0,
        description: '',
        availableUntil: '',
        requiresApproval: false,
        status: 'available'
      }
    ]
  })

  const [showLocationOptions, setShowLocationOptions] = useState(false)
  const [showDescriptionOptions, setShowDescriptionOptions] = useState(false)
  const [showEventOptions, setShowEventOptions] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showCapacityModal, setShowCapacityModal] = useState(false)

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateDescription = async () => {
    setIsGeneratingDescription(true)
    // Simular geração de descrição com IA
    setTimeout(() => {
      const aiDescription = `Descrição gerada automaticamente para "${formData.title}". Este evento promete ser uma experiência única e envolvente para todos os participantes.`
      handleInputChange('description', aiDescription)
      setIsGeneratingDescription(false)
    }, 2000)
  }

  const handleSubmit = async () => {
    try {
      // Aqui você implementaria a lógica de criação do evento
      console.log('Criando evento:', formData)
      router.push('/events')
    } catch (error) {
      console.error('Erro ao criar evento:', error)
    }
  }

  const handleTicketSave = (ticketBatches: any[]) => {
    handleInputChange('ticketBatches', ticketBatches)
  }

  const handleCapacitySave = (capacity: number | null, waitlistEnabled: boolean) => {
    handleInputChange('capacity', capacity)
    // Aqui você poderia adicionar waitlistEnabled ao formData se necessário
  }

  const currentTheme = themes.find(t => t.id === formData.theme) || themes[0]

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Preview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Event Preview Card */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className={`${currentTheme.preview} rounded-xl p-6 text-white mb-4`}>
                <h3 className="text-2xl font-bold mb-2">
                  {formData.title || 'Nome do Evento'}
                </h3>
                <p className="text-white/80 text-sm">
                  {formData.visibility === 'public' ? 'Público' : 'Privado'}
                </p>
              </div>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {formData.startDate || 'Data do evento'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {formData.startTime || 'Horário'} - {formData.endTime || 'Horário'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {formData.location || 'Local do evento'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">
                    {formData.isFree ? 'Gratuito' : `${formData.price} ${formData.currency}`}
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full p-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 transition-colors">
                <ImageIcon className="w-5 h-5 mx-auto" />
              </button>
            </div>

            {/* Theme Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tema</h3>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-8 ${currentTheme.preview} rounded-lg`}></div>
                <span className="text-sm">{currentTheme.name}</span>
                <div className="flex space-x-1 ml-auto">
                  <button className="p-1 rounded hover:bg-gray-800 transition-colors">
                    <span className="text-xs">◀</span>
                  </button>
                  <button className="p-1 rounded hover:bg-gray-800 transition-colors">
                    <span className="text-xs">▶</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleInputChange('theme', theme.id)}
                    className={`w-full h-8 ${theme.preview} rounded-lg border-2 ${
                      formData.theme === theme.id ? 'border-white' : 'border-transparent'
                    } transition-colors`}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Event Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar and Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Calendário</label>
                <select
                  value={formData.calendar}
                  onChange={(e) => handleInputChange('calendar', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.icon} {calendar.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Visibilidade</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="public">🌐 Público</option>
                  <option value="private">🔒 Privado</option>
                </select>
              </div>
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Evento</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Digite o nome do seu evento"
                className="w-full p-4 text-xl bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Início</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fim</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="text-sm text-gray-400">
              GMT-03:00 São Paulo
            </div>

            {/* Location */}
            <div>
              <button
                onClick={() => setShowLocationOptions(!showLocationOptions)}
                className="flex items-center space-x-2 text-left w-full p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>Adicionar Local do Evento</span>
              </button>
              <p className="text-sm text-gray-400 mt-1">Localização offline ou link virtual</p>
              
              {showLocationOptions && (
                <div className="mt-4 space-y-4 p-4 bg-gray-800 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Local</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="physical"
                          checked={formData.locationType === 'physical'}
                          onChange={(e) => handleInputChange('locationType', e.target.value)}
                          className="mr-2"
                        />
                        Presencial
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="virtual"
                          checked={formData.locationType === 'virtual'}
                          onChange={(e) => handleInputChange('locationType', e.target.value)}
                          className="mr-2"
                        />
                        Virtual
                      </label>
                    </div>
                  </div>
                  
                  {formData.locationType === 'physical' ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">Local</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Insira o local do evento"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">Link Virtual</label>
                      <input
                        type="url"
                        value={formData.virtualLink}
                        onChange={(e) => handleInputChange('virtualLink', e.target.value)}
                        placeholder="Insira o link virtual"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="mt-3 space-y-2">
                        <button className="flex items-center space-x-2 w-full p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                          <span>📹</span>
                          <span>Criar reunião no Zoom</span>
                        </button>
                        <button className="flex items-center space-x-2 w-full p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                          <span>📅</span>
                          <span>Criar Google Meet</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <button
                onClick={() => setShowDescriptionOptions(!showDescriptionOptions)}
                className="flex items-center space-x-2 text-left w-full p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <span>📄</span>
                <span>Adicionar Descrição</span>
              </button>
              
              {showDescriptionOptions && (
                <div className="mt-4 space-y-4">
                  <div className="flex space-x-2">
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descreva seu evento..."
                      rows={4}
                      className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={generateDescription}
                      disabled={isGeneratingDescription}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                    >
                      {isGeneratingDescription ? (
                        <Sparkles className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Use IA para gerar uma descrição automática baseada no nome do evento
                  </p>
                </div>
              )}
            </div>

            {/* Event Options */}
            <div>
              <button
                onClick={() => setShowEventOptions(!showEventOptions)}
                className="flex items-center space-x-2 text-left w-full p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Opções de Evento</span>
              </button>
              
              {showEventOptions && (
                <div className="mt-4 space-y-4 p-4 bg-gray-800 rounded-lg">
                  {/* Tickets */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Ticket className="w-5 h-5" />
                      <span>Ingressos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {formData.ticketBatches.length} lote(s) configurado(s)
                      </span>
                      <button 
                        onClick={() => setShowTicketModal(true)}
                        className="text-primary-500 hover:text-primary-400"
                      >
                        <span>🔗</span>
                      </button>
                    </div>
                  </div>

                  {/* Require Approval */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-5 h-5" />
                      <span>Exigir Aprovação</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiresApproval}
                        onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-5 h-5" />
                      <span>Capacidade</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {formData.capacity ? `${formData.capacity} pessoas` : 'Ilimitado'}
                      </span>
                      <button 
                        onClick={() => setShowCapacityModal(true)}
                        className="text-primary-500 hover:text-primary-400"
                      >
                        <span>🔗</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Create Event Button */}
            <div className="pt-6">
              <Button
                onClick={handleSubmit}
                className="w-full py-4 text-lg font-semibold"
                variant="primary"
              >
                Criar Evento
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TicketConfigurationModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onSave={handleTicketSave}
        initialTickets={formData.ticketBatches}
      />

      <CapacityConfigurationModal
        isOpen={showCapacityModal}
        onClose={() => setShowCapacityModal(false)}
        onSave={handleCapacitySave}
        initialCapacity={formData.capacity}
      />
    </div>
  )
}
