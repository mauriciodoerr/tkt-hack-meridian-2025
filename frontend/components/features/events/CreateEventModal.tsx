'use client'

import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button, Input } from '../../ui'
import { Calendar, MapPin, Users, DollarSign, X } from 'lucide-react'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateEvent: (eventData: any) => void
}

export function CreateEventModal({ isOpen, onClose, onCreateEvent }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    price: '',
    category: 'technology',
    requiresApproval: false,
    ticketBatches: [
      {
        id: 'batch-1',
        name: 'Lote 1',
        price: 0,
        description: '',
        availableUntil: '',
        requiresApproval: false,
        status: 'available' as const
      }
    ]
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simular criação do evento
    setTimeout(() => {
      const eventData = {
        ...formData,
        id: Date.now().toString(),
        attendees: 0,
        status: 'active' as const,
        rating: 0,
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&h=300&fit=crop'
      }
      
      onCreateEvent(eventData)
      onClose()
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          maxAttendees: '',
          price: '',
          category: 'technology',
          requiresApproval: false,
          ticketBatches: [
            {
              id: 'batch-1',
              name: 'Lote 1',
              price: 0,
              description: '',
              availableUntil: '',
              requiresApproval: false,
              status: 'available' as const
            }
          ]
        })
      setCurrentStep(1)
      setIsSubmitting(false)
    }, 2000)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description
      case 2:
        return formData.date && formData.time && formData.location
      case 3:
        return formData.maxAttendees && formData.price
      case 4:
        return formData.ticketBatches.length > 0
      default:
        return false
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Criar Novo Evento</h2>
            <p className="text-gray-400">Passo {currentStep} de {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    i + 1 <= currentStep
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      i + 1 < currentStep ? 'bg-primary-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Evento
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Workshop de Blockchain"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva seu evento..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="technology">Tecnologia</option>
                  <option value="business">Negócios</option>
                  <option value="education">Educação</option>
                  <option value="entertainment">Entretenimento</option>
                  <option value="sports">Esportes</option>
                  <option value="culture">Cultura</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Data e Local</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Data
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Horário
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Local
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ex: Centro de Convenções, São Paulo"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Configurações</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Capacidade Máxima
                  </label>
                  <Input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Preço Base (R$)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 bg-white/5 border-white/10 rounded focus:ring-primary-500"
                />
                <label htmlFor="requiresApproval" className="text-sm text-gray-300">
                  Exigir aprovação para inscrições
                </label>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-blue-400 font-semibold mb-2">💡 Dica</h4>
                <p className="text-sm text-gray-300">
                  Eventos gratuitos tendem a ter mais participantes. Considere começar com preços baixos para atrair público.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Configuração de Inscrições</h3>
              
              <div className="space-y-4">
                {formData.ticketBatches.map((batch, index) => (
                  <div key={batch.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">{batch.name}</h4>
                      {formData.ticketBatches.length > 1 && (
                        <button
                          onClick={() => {
                            const newBatches = formData.ticketBatches.filter((_, i) => i !== index)
                            setFormData(prev => ({ ...prev, ticketBatches: newBatches }))
                          }}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nome do Lote
                        </label>
                        <Input
                          placeholder="Ex: Early Bird"
                          value={batch.name}
                          onChange={(e) => {
                            const newBatches = [...formData.ticketBatches]
                            newBatches[index].name = e.target.value
                            setFormData(prev => ({ ...prev, ticketBatches: newBatches }))
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Preço (R$)
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={batch.price}
                          onChange={(e) => {
                            const newBatches = [...formData.ticketBatches]
                            newBatches[index].price = parseFloat(e.target.value) || 0
                            setFormData(prev => ({ ...prev, ticketBatches: newBatches }))
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        placeholder="Descreva os benefícios deste lote..."
                        value={batch.description}
                        onChange={(e) => {
                          const newBatches = [...formData.ticketBatches]
                          newBatches[index].description = e.target.value
                          setFormData(prev => ({ ...prev, ticketBatches: newBatches }))
                        }}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-3 mt-4">
                      <input
                        type="checkbox"
                        id={`approval-${index}`}
                        checked={batch.requiresApproval}
                        onChange={(e) => {
                          const newBatches = [...formData.ticketBatches]
                          newBatches[index].requiresApproval = e.target.checked
                          setFormData(prev => ({ ...prev, ticketBatches: newBatches }))
                        }}
                        className="w-4 h-4 text-primary-500 bg-white/5 border-white/10 rounded focus:ring-primary-500"
                      />
                      <label htmlFor={`approval-${index}`} className="text-sm text-gray-300">
                        Exigir aprovação para este lote
                      </label>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    const newBatch = {
                      id: `batch-${Date.now()}`,
                      name: `Lote ${formData.ticketBatches.length + 1}`,
                      price: 0,
                      description: '',
                      availableUntil: '',
                      requiresApproval: false,
                      status: 'available' as const
                    }
                    setFormData(prev => ({ 
                      ...prev, 
                      ticketBatches: [...prev.ticketBatches, newBatch] 
                    }))
                  }}
                  className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-white hover:border-primary-500 hover:text-primary-400 transition-colors"
                >
                  + Adicionar Lote
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
          >
            {currentStep === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          <div className="flex items-center space-x-3">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  'Criar Evento'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
