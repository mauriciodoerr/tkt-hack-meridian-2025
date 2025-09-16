'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../ui'
import { Target, Plus, TrendingUp, Wallet, Calendar, CheckCircle } from 'lucide-react'
import { Goal } from '../../../app/types'

interface GoalsCardProps {
  goals: Goal[]
  onAddGoal?: () => void
  onEditGoal?: (goalId: string) => void
}

export function GoalsCard({ goals, onAddGoal, onEditGoal }: GoalsCardProps) {
  const [showAll, setShowAll] = useState(false)

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <Wallet className="w-5 h-5" />
      case 'events':
        return <Calendar className="w-5 h-5" />
      case 'social':
        return <TrendingUp className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  const getGoalColor = (type: string) => {
    switch (type) {
      case 'savings':
        return 'from-green-500/20 to-green-600/20 text-green-400'
      case 'events':
        return 'from-purple-500/20 to-purple-600/20 text-purple-400'
      case 'social':
        return 'from-blue-500/20 to-blue-600/20 text-blue-400'
      default:
        return 'from-primary-500/20 to-primary-600/20 text-primary-400'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const displayedGoals = showAll ? goals : goals.slice(0, 3)

  return (
    <Card variant="premium" className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-white">Metas e Objetivos</CardTitle>
              <p className="text-sm text-gray-400">Acompanhe seu progresso</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddGoal || (() => console.log('Add goal'))}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1 flex flex-col">
          {displayedGoals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Nenhuma meta definida</p>
              <Button onClick={onAddGoal}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </div>
          ) : (
            displayedGoals.map((goal) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100)
              
              return (
                <div key={goal.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getGoalColor(goal.type)} flex items-center justify-center`}>
                        {getGoalIcon(goal.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{goal.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">Prazo: {goal.deadline}</p>
                      </div>
                    </div>
                    {goal.completed && (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        {goal.type === 'savings' 
                          ? `R$ ${goal.current.toLocaleString('pt-BR')} / R$ ${goal.target.toLocaleString('pt-BR')}`
                          : `${goal.current} / ${goal.target}`
                        }
                      </span>
                      <span className="text-white font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditGoal?.(goal.id)}
                      className="text-xs"
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              )
            })
          )}
          
          {goals.length > 3 && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Ver Menos' : `Ver Todas (${goals.length})`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
