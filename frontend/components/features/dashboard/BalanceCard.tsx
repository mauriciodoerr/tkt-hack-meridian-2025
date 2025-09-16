'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { Button } from '../../ui/Button'
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface BalanceCardProps {
  balance: number
  currency?: string
  onAddFunds?: () => void
  onWithdraw?: () => void
  recentTransactions?: Array<{
    id: string
    type: 'credit' | 'debit'
    amount: number
    description: string
    timestamp: string
  }>
}

export function BalanceCard({ 
  balance, 
  currency = 'TKT',
  onAddFunds,
  onWithdraw,
  recentTransactions = []
}: BalanceCardProps) {
  return (
    <Card variant="glow" className="relative overflow-hidden h-full flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-white">Saldo Atual</CardTitle>
              <p className="text-sm text-gray-400">Seus tokens TKT</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col">
        <div className="space-y-8 flex-1 flex flex-col">
          {/* Balance */}
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-3">
              {balance.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </div>
            <div className="text-xl text-gray-400">{currency}</div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="flex-1 py-3"
              onClick={onAddFunds}
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar
            </Button>
            <Button
              variant="outline"
              className="flex-1 py-3"
              onClick={onWithdraw}
            >
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Sacar
            </Button>
          </div>
          
          {/* Recent transactions */}
          {recentTransactions.length > 0 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <h4 className="text-sm font-medium text-gray-400">Transações Recentes</h4>
              <div className="space-y-3 flex-1">
                {recentTransactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'credit' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{transaction.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{transaction.timestamp}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      {transaction.amount.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
