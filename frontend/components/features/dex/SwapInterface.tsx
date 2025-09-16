import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SwapQuote {
  amountOut: string
  priceImpact: number
  fee: string
  route: string[]
}

interface SwapInterfaceProps {
  userBalance: {
    TKT: string
    USDC: string
    XLM: string
    BRL: string
  }
  onSwap: (fromAsset: string, toAsset: string, amount: string) => Promise<void>
}

export function SwapInterface({ userBalance, onSwap }: SwapInterfaceProps) {
  const [fromAsset, setFromAsset] = useState('BRL')
  const [toAsset, setToAsset] = useState('TKT')
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const { toast } = useToast()

  const assets = [
    { code: 'BRL', name: 'Real Brasileiro', icon: '🇧🇷' },
    { code: 'TKT', name: 'EventCoin Token', icon: '🎫' },
    { code: 'USDC', name: 'USD Coin', icon: '💵' },
    { code: 'XLM', name: 'Stellar Lumens', icon: '⭐' }
  ]

  // Buscar cotação quando parâmetros mudarem
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      fetchQuote()
    } else {
      setQuote(null)
    }
  }, [fromAsset, toAsset, amount])

  const fetchQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return

    setLoading(true)
    try {
      const response = await fetch(`/api/dex/quote?fromAsset=${fromAsset}&toAsset=${toAsset}&amount=${amount}`)
      const data = await response.json()
      
      if (data.success) {
        setQuote(data.quote)
      } else {
        setQuote(null)
        toast({
          title: 'Erro',
          description: 'Não foi possível obter cotação',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!amount || !quote) return

    setSwapping(true)
    try {
      await onSwap(fromAsset, toAsset, amount)
      setAmount('')
      setQuote(null)
      toast({
        title: 'Sucesso',
        description: 'Swap realizado com sucesso!'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao realizar swap',
        variant: 'destructive'
      })
    } finally {
      setSwapping(false)
    }
  }

  const handleAssetSwap = () => {
    const temp = fromAsset
    setFromAsset(toAsset)
    setToAsset(temp)
    setAmount('')
    setQuote(null)
  }

  const getAssetBalance = (asset: string) => {
    return userBalance[asset as keyof typeof userBalance] || '0'
  }

  const getAssetIcon = (asset: string) => {
    return assets.find(a => a.code === asset)?.icon || '💰'
  }

  const getAssetName = (asset: string) => {
    return assets.find(a => a.code === asset)?.name || asset
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }

  const getPriceImpactColor = (impact: number) => {
    if (impact < 0.1) return 'text-green-400'
    if (impact < 0.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPriceImpactIcon = (impact: number) => {
    if (impact < 0.1) return <TrendingUp className="w-4 h-4" />
    if (impact < 0.5) return <TrendingDown className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Swap de Ativos</h2>
          <p className="text-gray-400">
            Troque entre BRL, TKT, USDC e XLM instantaneamente
          </p>
        </div>

        {/* From Asset */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            De
          </label>
          <div className="flex space-x-2">
            <Select
              value={fromAsset}
              onValueChange={setFromAsset}
              className="w-32"
            >
              {assets.map(asset => (
                <option key={asset.code} value={asset.code}>
                  {asset.icon} {asset.code}
                </option>
              ))}
            </Select>
            <div className="flex-1 relative">
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-lg pr-20"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                Saldo: {formatAmount(getAssetBalance(fromAsset))}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleAssetSwap}
            variant="outline"
            size="sm"
            className="rounded-full p-2"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* To Asset */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Para
          </label>
          <div className="flex space-x-2">
            <Select
              value={toAsset}
              onValueChange={setToAsset}
              className="w-32"
            >
              {assets.map(asset => (
                <option key={asset.code} value={asset.code}>
                  {asset.icon} {asset.code}
                </option>
              ))}
            </Select>
            <div className="flex-1 relative">
              <Input
                type="text"
                value={quote ? formatAmount(quote.amountOut) : '0.00'}
                readOnly
                className="text-lg bg-gray-700 text-gray-300"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                Saldo: {formatAmount(getAssetBalance(toAsset))}
              </div>
            </div>
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="space-y-3 p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Taxa de Trading</span>
              <span className="text-sm text-gray-400">{quote.fee} {fromAsset}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Impacto no Preço</span>
              <div className={`flex items-center space-x-1 ${getPriceImpactColor(quote.priceImpact)}`}>
                {getPriceImpactIcon(quote.priceImpact)}
                <span className="text-sm">{quote.priceImpact.toFixed(2)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Rota</span>
              <div className="flex items-center space-x-1">
                {quote.route.map((asset, index) => (
                  <React.Fragment key={index}>
                    <span className="text-sm">{getAssetIcon(asset)} {asset}</span>
                    {index < quote.route.length - 1 && (
                      <span className="text-gray-400">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {quote.priceImpact > 0.5 && (
              <div className="flex items-start space-x-2 p-2 bg-yellow-900/20 rounded border border-yellow-500/20">
                <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium">Alto impacto no preço</p>
                  <p>Este swap pode resultar em perda significativa devido ao baixo volume de liquidez.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!amount || !quote || loading || swapping || parseFloat(amount) <= 0}
          className="w-full"
          size="lg"
        >
          {swapping ? 'Processando...' : loading ? 'Calculando...' : 'Realizar Swap'}
        </Button>

        {/* Asset Balances */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          {assets.map(asset => (
            <div key={asset.code} className="text-center">
              <div className="text-sm text-gray-400">{asset.name}</div>
              <div className="text-lg font-medium text-white">
                {getAssetIcon(asset.code)} {formatAmount(getAssetBalance(asset.code))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
