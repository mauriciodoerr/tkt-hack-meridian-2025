'use client'

import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui'
import { X, Calendar, MapPin, DollarSign, Users, Star } from 'lucide-react'

interface FilterEventsModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: any) => void
}

export function FilterEventsModal({ isOpen, onClose, onApplyFilters }: FilterEventsModalProps) {
  const [filters, setFilters] = useState({
    dateRange: '',
    location: '',
    priceRange: '',
    attendees: '',
    rating: '',
    categories: [] as string[],
    status: ''
  })

  const dateRanges = [
    { value: '', label: 'Qualquer data' },
    { value: 'today', label: 'Hoje' },
    { value: 'tomorrow', label: 'Amanhã' },
    { value: 'thisWeek', label: 'Esta semana' },
    { value: 'thisMonth', label: 'Este mês' },
    { value: 'nextMonth', label: 'Próximo mês' }
  ]

  const priceRanges = [
    { value: '', label: 'Qualquer preço' },
    { value: 'free', label: 'Gratuito' },
    { value: 'low', label: 'Até R$ 50' },
    { value: 'medium', label: 'R$ 50 - R$ 200' },
    { value: 'high', label: 'Acima de R$ 200' }
  ]

  const attendeeRanges = [
    { value: '', label: 'Qualquer tamanho' },
    { value: 'small', label: 'Até 50 pessoas' },
    { value: 'medium', label: '50 - 200 pessoas' },
    { value: 'large', label: 'Acima de 200 pessoas' }
  ]

  const ratingRanges = [
    { value: '', label: 'Qualquer avaliação' },
    { value: '4.5', label: '4.5+ estrelas' },
    { value: '4.0', label: '4.0+ estrelas' },
    { value: '3.5', label: '3.5+ estrelas' }
  ]

  const categories = [
    { value: 'technology', label: 'Tecnologia', icon: '💻' },
    { value: 'business', label: 'Negócios', icon: '💼' },
    { value: 'education', label: 'Educação', icon: '📚' },
    { value: 'entertainment', label: 'Entretenimento', icon: '🎭' },
    { value: 'sports', label: 'Esportes', icon: '⚽' },
    { value: 'culture', label: 'Cultura', icon: '🎨' }
  ]

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'active', label: 'Ativo' },
    { value: 'sold-out', label: 'Esgotado' },
    { value: 'upcoming', label: 'Em breve' }
  ]

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: '',
      location: '',
      priceRange: '',
      attendees: '',
      rating: '',
      categories: [],
      status: ''
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateRange) count++
    if (filters.location) count++
    if (filters.priceRange) count++
    if (filters.attendees) count++
    if (filters.rating) count++
    if (filters.categories.length > 0) count++
    if (filters.status) count++
    return count
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Filtrar Eventos</h2>
            <p className="text-gray-400">
              {getActiveFiltersCount() > 0 
                ? `${getActiveFiltersCount()} filtro(s) ativo(s)`
                : 'Selecione critérios para refinar sua busca'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-6 max-h-96 overflow-y-auto scrollbar-modal">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Período
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dateRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange('dateRange', range.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.dateRange === range.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <MapPin className="w-4 h-4 inline mr-2" />
              Localização
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Online'].map(location => (
                <button
                  key={location}
                  onClick={() => handleFilterChange('location', location)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.location === location
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Preço
            </label>
            <div className="grid grid-cols-1 gap-2">
              {priceRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange('priceRange', range.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.priceRange === range.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Categorias
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryToggle(category.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.categories.includes(category.value)
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              Tamanho do Evento
            </label>
            <div className="grid grid-cols-1 gap-2">
              {attendeeRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange('attendees', range.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.attendees === range.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Star className="w-4 h-4 inline mr-2" />
              Avaliação
            </label>
            <div className="grid grid-cols-1 gap-2">
              {ratingRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange('rating', range.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.rating === range.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  onClick={() => handleFilterChange('status', status.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === status.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Todos
          </Button>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
