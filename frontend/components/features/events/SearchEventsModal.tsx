'use client'

import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button, Input } from '../../ui'
import { Search, MapPin, Calendar, DollarSign, X, Filter } from 'lucide-react'

interface SearchEventsModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (searchParams: any) => void
}

export function SearchEventsModal({ isOpen, onClose, onSearch }: SearchEventsModalProps) {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'date'
  })

  const categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'technology', label: 'Tecnologia' },
    { value: 'business', label: 'Negócios' },
    { value: 'education', label: 'Educação' },
    { value: 'entertainment', label: 'Entretenimento' },
    { value: 'sports', label: 'Esportes' },
    { value: 'culture', label: 'Cultura' }
  ]

  const sortOptions = [
    { value: 'date', label: 'Data' },
    { value: 'price', label: 'Preço' },
    { value: 'rating', label: 'Avaliação' },
    { value: 'attendees', label: 'Participantes' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    onSearch(searchParams)
    onClose()
  }

  const handleClear = () => {
    setSearchParams({
      query: '',
      category: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'date'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Busca por Texto</h2>
            <p className="text-gray-400">Digite palavras-chave para encontrar eventos específicos</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search Form */}
        <div className="space-y-6">
          {/* Query Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Buscar por palavra-chave
            </label>
            <Input
              value={searchParams.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
              placeholder="Ex: blockchain, workshop, música..."
            />
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={searchParams.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Local
              </label>
              <Input
                value={searchParams.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ex: São Paulo, Rio de Janeiro..."
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Período
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">De</label>
                <Input
                  type="date"
                  value={searchParams.dateFrom}
                  onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Até</label>
                <Input
                  type="date"
                  value={searchParams.dateTo}
                  onChange={(e) => handleInputChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Faixa de Preço
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Mínimo (R$)</label>
                <Input
                  type="number"
                  value={searchParams.priceMin}
                  onChange={(e) => handleInputChange('priceMin', e.target.value)}
                  placeholder="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Máximo (R$)</label>
                <Input
                  type="number"
                  value={searchParams.priceMax}
                  onChange={(e) => handleInputChange('priceMax', e.target.value)}
                  placeholder="1000"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Ordenar por
            </label>
            <select
              value={searchParams.sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <Button variant="outline" onClick={handleClear}>
            Limpar Filtros
          </Button>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
