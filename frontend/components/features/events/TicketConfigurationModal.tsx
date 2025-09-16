'use client'

import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button, Input } from '../../ui'
import { Plus, Trash2, DollarSign, Calendar, UserCheck } from 'lucide-react'

interface TicketBatch {
  id: string
  name: string
  price: number
  description: string
  availableUntil: string
  requiresApproval: boolean
  status: 'available' | 'sold_out'
}

interface TicketConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (ticketBatches: TicketBatch[]) => void
  initialTickets?: TicketBatch[]
}

export function TicketConfigurationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialTickets = [] 
}: TicketConfigurationModalProps) {
  const [ticketBatches, setTicketBatches] = useState<TicketBatch[]>(
    initialTickets.length > 0 ? initialTickets : [
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
  )

  const addTicketBatch = () => {
    const newBatch: TicketBatch = {
      id: `batch-${Date.now()}`,
      name: `Lote ${ticketBatches.length + 1}`,
      price: 0,
      description: '',
      availableUntil: '',
      requiresApproval: false,
      status: 'available'
    }
    setTicketBatches(prev => [...prev, newBatch])
  }

  const removeTicketBatch = (id: string) => {
    if (ticketBatches.length > 1) {
      setTicketBatches(prev => prev.filter(batch => batch.id !== id))
    }
  }

  const updateTicketBatch = (id: string, field: keyof TicketBatch, value: any) => {
    setTicketBatches(prev => 
      prev.map(batch => 
        batch.id === id ? { ...batch, [field]: value } : batch
      )
    )
  }

  const handleSave = () => {
    onSave(ticketBatches)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Configuração de Ingressos</h2>
            <p className="text-gray-400">Configure os lotes de ingressos para seu evento</p>
          </div>
        </div>

        {/* Ticket Batches */}
        <div className="space-y-6">
          {ticketBatches.map((batch, index) => (
            <div key={batch.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Lote {index + 1}</h3>
                {ticketBatches.length > 1 && (
                  <button
                    onClick={() => removeTicketBatch(batch.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome do Lote */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Lote
                  </label>
                  <Input
                    value={batch.name}
                    onChange={(e) => updateTicketBatch(batch.id, 'name', e.target.value)}
                    placeholder="Ex: Early Bird, Regular, VIP"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preço (TKT)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      value={batch.price}
                      onChange={(e) => updateTicketBatch(batch.id, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="pl-10 bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                {/* Data de Vencimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Disponível até
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="datetime-local"
                      value={batch.availableUntil}
                      onChange={(e) => updateTicketBatch(batch.id, 'availableUntil', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={batch.status}
                    onChange={(e) => updateTicketBatch(batch.id, 'status', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  >
                    <option value="available">Disponível</option>
                    <option value="sold_out">Esgotado</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={batch.description}
                  onChange={(e) => updateTicketBatch(batch.id, 'description', e.target.value)}
                  placeholder="Descreva o que está incluído neste lote..."
                  rows={3}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white resize-none"
                />
              </div>

              {/* Requer Aprovação */}
              <div className="mt-4 flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-gray-400" />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={batch.requiresApproval}
                    onChange={(e) => updateTicketBatch(batch.id, 'requiresApproval', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-300">Exigir aprovação para este lote</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Batch Button */}
        <div className="mt-6">
          <Button
            onClick={addTicketBatch}
            variant="outline"
            className="w-full border-dashed border-2 border-gray-600 hover:border-primary-500 hover:bg-primary-500/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Novo Lote
          </Button>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            className="px-6"
          >
            Salvar Configuração
          </Button>
        </div>
      </div>
    </Modal>
  )
}
