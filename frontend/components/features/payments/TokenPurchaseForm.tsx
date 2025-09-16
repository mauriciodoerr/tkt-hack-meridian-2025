'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Modal } from '../../ui'
import { CreditCard, Wallet, CheckCircle, ArrowRight, Zap, QrCode, Copy } from 'lucide-react'
import QRCodeLib from 'qrcode'

interface TokenPurchaseFormProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (amount: number, paymentMethod: string) => void
}

export function TokenPurchaseForm({ isOpen, onClose, onPurchase }: TokenPurchaseFormProps) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'amount' | 'payment' | 'pix-qr' | 'success'>('amount')
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
  const [pixKey, setPixKey] = useState<string>('')
  const [pixCopySuccess, setPixCopySuccess] = useState(false)

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount && parseFloat(amount) > 0) {
      setStep('payment')
    }
  }

  const handlePurchase = async () => {
    if (paymentMethod === 'pix') {
      // Gerar dados PIX e QR Code
      await generatePixQR()
      setStep('pix-qr')
    } else {
      // Processar cartão
      setIsProcessing(true)
      
      setTimeout(() => {
        setIsProcessing(false)
        setStep('success')
        
        setTimeout(() => {
          onPurchase(parseFloat(amount), paymentMethod)
          onClose()
          resetForm()
        }, 2000)
      }, 3000)
    }
  }

  const generatePixQR = async () => {
    try {
      // Gerar chave PIX aleatória (em produção, viria do backend)
      const randomPixKey = `pix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setPixKey(randomPixKey)

      // Dados do PIX (formato simplificado para demonstração)
      const pixData = {
        amount: parseFloat(amount),
        pixKey: randomPixKey,
        description: `Compra de ${getTokenAmount()} tokens TKT - EventCoin`,
        merchant: 'EventCoin',
        transactionId: `TKT-${Date.now()}`
      }

      // Gerar QR Code
      const qrCodeString = JSON.stringify(pixData)
      const qrDataURL = await QRCodeLib.toDataURL(qrCodeString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeDataURL(qrDataURL)
    } catch (error) {
      console.error('Erro ao gerar QR Code PIX:', error)
    }
  }

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(pixKey)
      setPixCopySuccess(true)
      setTimeout(() => setPixCopySuccess(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar chave PIX:', error)
    }
  }

  const simulatePixPayment = () => {
    setIsProcessing(true)
    
    setTimeout(() => {
      setIsProcessing(false)
      setStep('success')
      
      setTimeout(() => {
        onPurchase(parseFloat(amount), paymentMethod)
        onClose()
        resetForm()
      }, 2000)
    }, 3000)
  }

  const resetForm = () => {
    setAmount('')
    setStep('amount')
    setQrCodeDataURL('')
    setPixKey('')
    setPixCopySuccess(false)
  }

  const formatAmount = (value: string) => {
    // Remover caracteres não numéricos exceto ponto
    const numericValue = value.replace(/[^\d.]/g, '')
    
    // Garantir apenas um ponto decimal
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    
    return numericValue
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmount(e.target.value))
  }

  const getTokenAmount = () => {
    const amountNum = parseFloat(amount) || 0
    return Math.floor(amountNum * 10) // 1 real = 10 tokens TKT
  }

  if (step === 'pix-qr') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Pagamento PIX
            </h2>
            <p className="text-gray-400">
              Escaneie o QR Code ou copie a chave PIX
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              {qrCodeDataURL ? (
                <img 
                  src={qrCodeDataURL} 
                  alt="QR Code PIX" 
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Detalhes do Pagamento */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-400">Valor:</span>
              <span className="text-white font-medium">R$ {parseFloat(amount).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-400">Tokens TKT:</span>
              <span className="text-primary-400 font-medium">{getTokenAmount()} TKT</span>
            </div>
          </div>

          {/* Chave PIX */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-300">Chave PIX:</p>
            <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
              <code className="flex-1 text-sm text-white font-mono break-all">
                {pixKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyPixKey}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {pixCopySuccess && (
              <p className="text-green-400 text-sm">Chave PIX copiada!</p>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-blue-500/10 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              💡 Abra seu app de banco, escaneie o QR Code ou cole a chave PIX para fazer o pagamento
            </p>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setStep('payment')} className="flex-1">
              Voltar
            </Button>
            <Button 
              onClick={simulatePixPayment}
              className="flex-1"
              loading={isProcessing}
              disabled={isProcessing}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Simular Pagamento'}
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
              Tokens Comprados!
            </h2>
            <p className="text-gray-400">
              Sua compra foi processada com sucesso
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white font-medium">
              {getTokenAmount()} tokens TKT adicionados à sua carteira
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Valor pago: R$ {parseFloat(amount).toFixed(2)}
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
            {step === 'amount' ? 'Comprar Tokens TKT' : 'Escolher Método de Pagamento'}
          </h2>
          <p className="text-gray-400">
            {step === 'amount' 
              ? 'Digite o valor que deseja investir em tokens'
              : 'Selecione como deseja pagar'
            }
          </p>
        </div>

        {step === 'amount' ? (
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
              {amount && parseFloat(amount) > 0 && (
                <div className="mt-2 p-3 bg-primary-500/10 rounded-lg">
                  <p className="text-primary-400 text-sm">
                    Você receberá: <span className="font-medium">{getTokenAmount()} tokens TKT</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Taxa de conversão: 1 real = 10 tokens TKT
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['50', '100', '200'].map((value) => (
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
              <ArrowRight className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Valor:</span>
                <span className="text-white font-medium">R$ {parseFloat(amount).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Tokens TKT:</span>
                <span className="text-primary-400 font-medium">{getTokenAmount()} TKT</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-300">Método de Pagamento:</p>
              
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'pix'
                    ? 'border-primary-400 bg-primary-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">PIX</p>
                    <p className="text-sm text-gray-400">Aprovação instantânea</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-primary-400 bg-primary-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-secondary-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Cartão de Crédito</p>
                    <p className="text-sm text-gray-400">Visa, Mastercard, Elo</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-green-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">
                Transação segura e criptografada
              </span>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep('amount')} className="flex-1">
                Voltar
              </Button>
              <Button 
                onClick={handlePurchase} 
                className="flex-1"
                loading={isProcessing}
                disabled={isProcessing}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processando...' : 'Finalizar Compra'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
