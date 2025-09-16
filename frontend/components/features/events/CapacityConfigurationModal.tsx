'use client'

import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button, Input } from '../../ui'
import { Users, Hash, AlertCircle } from 'lucide-react'

interface CapacityConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (capacity: number | null, waitlistEnabled: boolean) => void
  initialCapacity?: number | null
  initialWaitlistEnabled?: boolean
}

export function CapacityConfigurationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCapacity = null,
  initialWaitlistEnabled = false
}: CapacityConfigurationModalProps) {
  const [capacity, setCapacity] = useState<number | null>(initialCapacity)
  const [waitlistEnabled, setWaitlistEnabled] = useState(initialWaitlistEnabled)
  const [isUnlimited, setIsUnlimited] = useState(initialCapacity === null)

  const handleSave = () => {
    onSave(isUnlimited ? null : capacity, waitlistEnabled)
    onClose()
  }

  const handleCapacityChange = (value: string) => {
    const numValue = parseInt(value)
    if (isNaN(numValue) || numValue <= 0) {
      setCapacity(null)
    } else {
      setCapacity(numValue)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Capacidade Máxima</h2>
            <p className="text-gray-400">Configure o limite de participantes para seu evento</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Unlimited vs Limited */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="capacity"
                  checked={isUnlimited}
                  onChange={() => setIsUnlimited(true)}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
                />
                <div className="flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Ilimitado</span>
                </div>
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="capacity"
                  checked={!isUnlimited}
                  onChange={() => setIsUnlimited(false)}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
                />
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Limitado</span>
                </div>
              </label>
            </div>
          </div>

          {/* Capacity Input */}
          {!isUnlimited && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Número máximo de participantes
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={capacity || ''}
                  onChange={(e) => handleCapacityChange(e.target.value)}
                  placeholder="Ex: 100"
                  min="1"
                  className="pl-10 bg-gray-700 border-gray-600"
                />
              </div>
              <p className="text-sm text-gray-400">
                As inscrições serão fechadas automaticamente quando a capacidade for atingida
              </p>
            </div>
          )}

          {/* Waitlist Option */}
          {!isUnlimited && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white mb-2">
                    Lista de Espera
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Quando a capacidade for atingida, permitir que pessoas se inscrevam em uma lista de espera
                  </p>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={waitlistEnabled}
                      onChange={(e) => setWaitlistEnabled(e.target.checked)}
                      className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">Habilitar lista de espera</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">
                  Como funciona?
                </h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• <strong>Ilimitado:</strong> Qualquer pessoa pode se inscrever</li>
                  <li>• <strong>Limitado:</strong> Inscrições fecham quando atingir o limite</li>
                  <li>• <strong>Lista de espera:</strong> Pessoas podem se inscrever mesmo com limite atingido</li>
                </ul>
              </div>
            </div>
          </div>
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
