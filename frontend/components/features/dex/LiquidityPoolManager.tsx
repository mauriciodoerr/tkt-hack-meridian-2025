import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  DollarSign, 
  BarChart3,
  Info,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PoolInfo {
  poolId: string
  assetA: string
  assetB: string
  reservesA: string
  reservesB: string
  totalShares: string
  priceA: number
  priceB: number
  liquidity: number
}

interface LiquidityPosition {
  poolId: string
  shares: string
  assetAAmount: string
  assetBAmount: string
  valueUSD: number
  apy: number
}

interface LiquidityPoolManagerProps {
  userBalance: {
    TKT: string
    USDC: string
    XLM: string
  }
  onAddLiquidity: (poolId: string, amountA: string, amountB: string) => Promise<void>
  onRemoveLiquidity: (poolId: string, shares: string) => Promise<void>
}

export function LiquidityPoolManager({ 
  userBalance, 
  onAddLiquidity, 
  onRemoveLiquidity 
}: LiquidityPoolManagerProps) {
  const [pools, setPools] = useState<PoolInfo[]>([])
  const [positions, setPositions] = useState<LiquidityPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pools')
  
  // Add Liquidity State
  const [selectedPool, setSelectedPool] = useState('')
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [addingLiquidity, setAddingLiquidity] = useState(false)
  
  // Remove Liquidity State
  const [removingLiquidity, setRemovingLiquidity] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchPools()
    fetchPositions()
  }, [])

  const fetchPools = async () => {
    try {
      const response = await fetch('/api/dex/pools')
      const data = await response.json()
      
      if (data.success) {
        setPools(data.pools)
      }
    } catch (error) {
      console.error('Error fetching pools:', error)
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/dex/liquidity-positions')
      const data = await response.json()
      
      if (data.success) {
        setPositions(data.positions)
      }
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLiquidity = async () => {
    if (!selectedPool || !amountA || !amountB) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive'
      })
      return
    }

    setAddingLiquidity(true)
    try {
      await onAddLiquidity(selectedPool, amountA, amountB)
      setAmountA('')
      setAmountB('')
      setSelectedPool('')
      await fetchPools()
      await fetchPositions()
      toast({
        title: 'Sucesso',
        description: 'Liquidez adicionada com sucesso!'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar liquidez',
        variant: 'destructive'
      })
    } finally {
      setAddingLiquidity(false)
    }
  }

  const handleRemoveLiquidity = async (poolId: string, shares: string) => {
    setRemovingLiquidity(true)
    try {
      await onRemoveLiquidity(poolId, shares)
      await fetchPools()
      await fetchPositions()
      toast({
        title: 'Sucesso',
        description: 'Liquidez removida com sucesso!'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao remover liquidez',
        variant: 'destructive'
      })
    } finally {
      setRemovingLiquidity(false)
    }
  }

  const calculateOptimalAmounts = (pool: PoolInfo, inputAmount: string, asset: 'A' | 'B') => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return

    const reserveA = parseFloat(pool.reservesA)
    const reserveB = parseFloat(pool.reservesB)
    
    if (asset === 'A') {
      const amountB = (parseFloat(inputAmount) * reserveB) / reserveA
      setAmountB(amountB.toString())
    } else {
      const amountA = (parseFloat(inputAmount) * reserveA) / reserveB
      setAmountA(amountA.toString())
    }
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }

  const formatUSD = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'USD'
    })
  }

  const getAssetIcon = (asset: string) => {
    const icons: { [key: string]: string } = {
      'TKT': '🎫',
      'USDC': '💵',
      'XLM': '⭐'
    }
    return icons[asset] || '💰'
  }

  if (loading) {
    return (
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando pools de liquidez...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Pools de Liquidez</h2>
          <p className="text-gray-400">
            Forneça liquidez e ganhe com taxas de trading
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pools">Pools Disponíveis</TabsTrigger>
            <TabsTrigger value="positions">Minhas Posições</TabsTrigger>
          </TabsList>

          <TabsContent value="pools" className="space-y-4">
            {/* Available Pools */}
            <div className="grid gap-4">
              {pools.map(pool => (
                <div key={pool.poolId} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getAssetIcon(pool.assetA)}</span>
                      <span className="text-lg">{getAssetIcon(pool.assetB)}</span>
                      <span className="font-medium text-white">
                        {pool.assetA}/{pool.assetB}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      TVL: {formatUSD(pool.liquidity)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Preço {pool.assetA}</div>
                      <div className="text-lg font-medium text-white">
                        {formatAmount(pool.priceA.toString())} {pool.assetB}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Preço {pool.assetB}</div>
                      <div className="text-lg font-medium text-white">
                        {formatAmount(pool.priceB.toString())} {pool.assetA}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Reservas: {formatAmount(pool.reservesA)} {pool.assetA} + {formatAmount(pool.reservesB)} {pool.assetB}
                    </div>
                    <Button
                      onClick={() => setSelectedPool(pool.poolId)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Liquidity Form */}
            {selectedPool && (
              <div className="p-4 bg-gray-700 rounded-lg border border-primary-500/20">
                <h3 className="text-lg font-medium text-white mb-4">
                  Adicionar Liquidez - {selectedPool}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {pools.find(p => p.poolId === selectedPool)?.assetA}
                    </label>
                    <Input
                      type="text"
                      value={amountA}
                      onChange={(e) => {
                        setAmountA(e.target.value)
                        const pool = pools.find(p => p.poolId === selectedPool)
                        if (pool) calculateOptimalAmounts(pool, e.target.value, 'A')
                      }}
                      placeholder="0.00"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Saldo: {formatAmount(userBalance[pools.find(p => p.poolId === selectedPool)?.assetA as keyof typeof userBalance] || '0')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {pools.find(p => p.poolId === selectedPool)?.assetB}
                    </label>
                    <Input
                      type="text"
                      value={amountB}
                      onChange={(e) => {
                        setAmountB(e.target.value)
                        const pool = pools.find(p => p.poolId === selectedPool)
                        if (pool) calculateOptimalAmounts(pool, e.target.value, 'B')
                      }}
                      placeholder="0.00"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Saldo: {formatAmount(userBalance[pools.find(p => p.poolId === selectedPool)?.assetB as keyof typeof userBalance] || '0')}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAddLiquidity}
                      disabled={addingLiquidity || !amountA || !amountB}
                      className="flex-1"
                    >
                      {addingLiquidity ? 'Adicionando...' : 'Adicionar Liquidez'}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedPool('')
                        setAmountA('')
                        setAmountB('')
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            {positions.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Você não possui posições de liquidez</p>
                <p className="text-sm text-gray-500 mt-1">
                  Adicione liquidez aos pools para começar a ganhar
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {positions.map(position => (
                  <div key={position.poolId} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getAssetIcon(position.poolId.split('_')[0])}</span>
                        <span className="text-lg">{getAssetIcon(position.poolId.split('_')[1])}</span>
                        <span className="font-medium text-white">
                          {position.poolId.replace('_', '/')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-white">
                          {formatUSD(position.valueUSD)}
                        </div>
                        <div className="text-sm text-green-400">
                          APY: {position.apy.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Participação</div>
                        <div className="text-lg font-medium text-white">
                          {formatAmount(position.shares)} shares
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Valor Total</div>
                        <div className="text-lg font-medium text-white">
                          {formatUSD(position.valueUSD)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        {formatAmount(position.assetAAmount)} + {formatAmount(position.assetBAmount)}
                      </div>
                      <Button
                        onClick={() => handleRemoveLiquidity(position.poolId, position.shares)}
                        disabled={removingLiquidity}
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Como funcionam os Pools de Liquidez?</p>
              <ul className="space-y-1 text-blue-300">
                <li>• Forneça pares de tokens para criar liquidez</li>
                <li>• Ganhe 0.3% de todas as taxas de trading</li>
                <li>• Receba tokens LP como comprovante</li>
                <li>• Remova liquidez a qualquer momento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
