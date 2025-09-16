'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Modal } from '../../ui'
import { Send, User, QrCode, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import QRCodeLib from 'qrcode'

interface P2PTransferFormProps {
  isOpen: boolean
  onClose: () => void
  onTransfer: (amount: number, recipientId: string, recipientName: string) => void
}

export function P2PTransferForm({ isOpen, onClose, onTransfer }: P2PTransferFormProps) {
  const [step, setStep] = useState<'recipient' | 'amount' | 'confirm' | 'success'>('recipient')
  const [recipientId, setRecipientId] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState(false)

  const handleRecipientSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (recipientId.trim()) {
      // Simular busca do usuário
      setRecipientName('João Silva') // Em produção, viria da API
      setStep('amount')
    }
  }

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount && parseFloat(amount) > 0) {
      setStep('confirm')
    }
  }

  const handleTransfer = async () => {
    setIsProcessing(true)
    
    setTimeout(() => {
      setIsProcessing(false)
      setStep('success')
      
      setTimeout(() => {
        onTransfer(parseFloat(amount), recipientId, recipientName)
        onClose()
        resetForm()
      }, 2000)
    }, 3000)
  }

  const generateReceiveQR = async () => {
    try {
      const receiveData = {
        type: 'p2p_receive',
        userId: 'user_123', // ID do usuário atual
        userName: 'Seu Nome',
        timestamp: new Date().toISOString()
      }

      const qrCodeString = JSON.stringify(receiveData)
      const qrDataURL = await QRCodeLib.toDataURL(qrCodeString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeDataURL(qrDataURL)
      setShowQRCode(true)
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
    }
  }

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '')
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    return numericValue
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmount(e.target.value))
  }

  const getFeeAmount = () => {
    const amountNum = parseFloat(amount) || 0
    return amountNum * 0.05 // 5% de taxa
  }

  const getRecipientAmount = () => {
    const amountNum = parseFloat(amount) || 0
    return amountNum * 0.95 // 95% para o destinatário
  }

  const resetForm = () => {
    setStep('recipient')
    setRecipientId('')
    setRecipientName('')
    setAmount('')
    setQrCodeDataURL('')
    setShowQRCode(false)
  }

  if (showQRCode) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Receber Pagamento
            </h2>
            <p className="text-gray-400">
              Compartilhe seu QR Code para receber tokens TKT
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              {qrCodeDataURL ? (
                <img 
                  src={qrCodeDataURL} 
                  alt="QR Code para receber" 
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-500/10 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              💡 Outros usuários podem escanear este QR Code para enviar tokens TKT para você
            </p>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowQRCode(false)} className="flex-1">
              Voltar
            </Button>
            <Button onClick={onClose} className="flex-1">
              Concluir
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  if (step === 'success') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Transferência Realizada!
            </h2>
            <p className="text-gray-400">
              Tokens TKT enviados com sucesso
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white font-medium">
              R$ {parseFloat(amount).toFixed(2)} enviados para {recipientName}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Taxa de 5% aplicada (R$ {getFeeAmount().toFixed(2)})
            </p>
          </div>

          <Button onClick={onClose} className="w-full">
            Concluir
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 'recipient' ? 'Enviar Tokens TKT' : 
             step === 'amount' ? 'Valor da Transferência' : 'Confirmar Transferência'}
          </h2>
          <p className="text-gray-400">
            {step === 'recipient' ? 'Digite o ID do usuário ou escaneie QR Code' :
             step === 'amount' ? 'Digite o valor que deseja enviar' :
             'Revise os detalhes da transferência'}
          </p>
        </div>

        {step === 'recipient' ? (
          <form onSubmit={handleRecipientSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID do Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  placeholder="user_123 ou @username"
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="text-center">
              <span className="text-gray-400">ou</span>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={generateReceiveQR}>
              <QrCode className="w-4 h-4 mr-2" />
              Escanear QR Code
            </Button>

            <Button type="submit" className="w-full" disabled={!recipientId.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </form>
        ) : step === 'amount' ? (
          <form onSubmit={handleAmountSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor em Reais (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  R$
                </span>
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="pl-10 text-lg"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['25', '50', '100'].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(value)}
                  className="text-sm"
                >
                  R$ {value}
                </Button>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
              <Send className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Para:</span>
                <span className="text-white font-medium">{recipientName}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Valor:</span>
                <span className="text-white font-medium">R$ {parseFloat(amount).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Taxa (5%):</span>
                <span className="text-primary-400 font-medium">R$ {getFeeAmount().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Destinatário recebe:</span>
                <span className="text-green-400 font-medium">R$ {getRecipientAmount().toFixed(2)}</span>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total a pagar:</span>
                  <span className="text-white font-bold text-lg">R$ {parseFloat(amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 text-sm">
                Transferência P2P: Taxa de 5% aplicada
              </span>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep('amount')} className="flex-1">
                Voltar
              </Button>
              <Button 
                onClick={handleTransfer} 
                className="flex-1"
                loading={isProcessing}
                disabled={isProcessing}
              >
                <Send className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processando...' : 'Confirmar Transferência'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
