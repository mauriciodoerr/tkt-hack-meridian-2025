'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EventCard } from '../../components/features/events/EventCard'
import { SearchEventsModal } from '../../components/features/events/SearchEventsModal'
import { FilterEventsModal } from '../../components/features/events/FilterEventsModal'
import { EventSidePanel } from '../../components/features/events/EventSidePanel'
import { Button, Input } from '../../components/ui'
import { Navbar } from '../../components/layout/Navbar'
import { Search, Filter, Plus, Calendar } from 'lucide-react'
import { apiClientInstance } from '../utils/api-client-factory'
import { Event, EventFilters } from '../types'

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<EventFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreEvents, setHasMoreEvents] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventSidePanel, setShowEventSidePanel] = useState(false)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Load events on component mount
  useEffect(() => {
    loadEvents()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [events, activeFilters, searchQuery])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClientInstance.getEvents(1, 20, activeFilters)
      
      if (response.success) {
        setEvents(response.data.data)
        setHasMoreEvents(response.data.pagination.page < response.data.pagination.totalPages)
      } else {
        setError(response.error || 'Failed to load events')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreEvents = async () => {
    if (isLoadingMore || !hasMoreEvents) return

    try {
      setIsLoadingMore(true)
      
      const currentPage = Math.ceil(events.length / 20) + 1
      const response = await apiClientInstance.getEvents(currentPage, 20, activeFilters)
      
      if (response.success) {
        setEvents(prev => [...prev, ...response.data.data])
        setHasMoreEvents(response.data.pagination.page < response.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Failed to load more events:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...events]

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply other filters
    if (activeFilters.status) {
      filtered = filtered.filter(event => event.status === activeFilters.status)
    }

    if (activeFilters.category) {
      filtered = filtered.filter(event => event.category === activeFilters.category)
    }

    if (activeFilters.priceRange) {
      const [min, max] = activeFilters.priceRange.split('-').map(Number)
      filtered = filtered.filter(event => event.price >= min && event.price <= max)
    }

    setFilteredEvents(filtered)
  }

  const handleCreateEvent = () => {
    router.push('/events/create')
  }

  const handleSearchEvents = () => {
    setShowSearchModal(true)
  }

  const handleFilterEvents = () => {
    setShowFilterModal(true)
  }


  const handleSearchSubmit = (searchParams: any) => {
    setSearchQuery(searchParams.query || '')
    setActiveFilters(prev => ({ ...prev, search: searchParams.query }))
    setShowSearchModal(false)
  }

  const handleFilterSubmit = (filters: EventFilters) => {
    setActiveFilters(filters)
    setShowFilterModal(false)
  }

  const handleEventClick = (event: Event) => {
    const eventIndex = filteredEvents.findIndex(e => e.id === event.id)
    setCurrentEventIndex(eventIndex)
    setSelectedEvent(event)
    setShowEventSidePanel(true)
  }

  const handleNavigateEvent = (index: number) => {
    if (index >= 0 && index < filteredEvents.length) {
      setCurrentEventIndex(index)
      setSelectedEvent(filteredEvents[index])
    }
  }

  const handleJoinEvent = async (eventId: string) => {
    try {
      const response = await apiClientInstance.joinEvent(eventId)
      
      if (response.success) {
        // Update the event in the list
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, attendees: event.attendees + 1 }
            : event
        ))
        console.log('Joined event:', response.data)
      } else {
        console.error('Failed to join event:', response.error)
      }
    } catch (err) {
      console.error('Error joining event:', err)
    }
  }

  const handleGoToEventPage = (eventId: string) => {
    console.log('Navigate to event page:', eventId)
    // Implement navigation to full event page
  }

  const handleClearFilters = () => {
    setActiveFilters({})
    setSearchQuery('')
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchQuery

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Events</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadEvents} className="bg-primary-500 hover:bg-primary-600">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Eventos</h1>
            <p className="text-gray-400">
              {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={handleCreateEvent}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Evento
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark-800 border-dark-700 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSearchEvents}
              variant="outline"
              className="border-dark-700 text-gray-300 hover:bg-dark-800"
            >
              <Search className="w-4 h-4 mr-2" />
              Busca Avançada
            </Button>
            
            <Button
              onClick={handleFilterEvents}
              variant="outline"
              className="border-dark-700 text-gray-300 hover:bg-dark-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
              <p>
                {hasActiveFilters 
                  ? 'Tente ajustar os filtros ou criar um novo evento.'
                  : 'Seja o primeiro a criar um evento!'
                }
              </p>
            </div>
            {!hasActiveFilters && (
              <Button
                onClick={handleCreateEvent}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMoreEvents && filteredEvents.length > 0 && (
          <div className="text-center">
            <Button
              onClick={loadMoreEvents}
              disabled={isLoadingMore}
              variant="outline"
              className="border-dark-700 text-gray-300 hover:bg-dark-800"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
                  Carregando...
                </>
              ) : (
                'Carregar Mais Eventos'
              )}
            </Button>
          </div>
        )}

        {/* Modals */}
        <SearchEventsModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSubmit={handleSearchSubmit}
        />

        <FilterEventsModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApplyFilters={handleFilterSubmit}
        />

        <EventSidePanel
          isOpen={showEventSidePanel}
          onClose={() => {
            setShowEventSidePanel(false)
            setSelectedEvent(null)
          }}
          event={selectedEvent}
          events={filteredEvents}
          currentIndex={currentEventIndex}
          onNavigateEvent={handleNavigateEvent}
          onJoin={handleJoinEvent}
          onGoToEventPage={handleGoToEventPage}
        />
      </div>
    </div>
  )
}