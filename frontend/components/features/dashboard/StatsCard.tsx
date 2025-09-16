import { Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: LucideIcon
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
  description?: string
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'primary',
  description 
}: StatsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'from-primary-500/40 to-primary-600/40 text-primary-300'
      case 'secondary':
        return 'from-secondary-500/40 to-secondary-600/40 text-secondary-300'
      case 'accent':
        return 'from-accent-500/40 to-accent-600/40 text-accent-300'
      case 'success':
        return 'from-green-500/40 to-green-600/40 text-green-300'
      case 'warning':
        return 'from-yellow-500/40 to-yellow-600/40 text-yellow-300'
      case 'danger':
        return 'from-red-500/40 to-red-600/40 text-red-300'
      default:
        return 'from-primary-500/40 to-primary-600/40 text-primary-300'
    }
  }

  const getCardGradient = (color: string) => {
    switch (color) {
      case 'primary':
        return 'from-primary-500/5 via-primary-600/5 to-primary-700/5'
      case 'secondary':
        return 'from-secondary-500/5 via-secondary-600/5 to-secondary-700/5'
      case 'accent':
        return 'from-accent-500/5 via-accent-600/5 to-accent-700/5'
      case 'success':
        return 'from-green-500/5 via-green-600/5 to-green-700/5'
      case 'warning':
        return 'from-yellow-500/5 via-yellow-600/5 to-yellow-700/5'
      case 'danger':
        return 'from-red-500/5 via-red-600/5 to-red-700/5'
      default:
        return 'from-primary-500/5 via-primary-600/5 to-primary-700/5'
    }
  }

  const getChangeColor = (type: string) => {
    return type === 'increase' ? 'text-green-400' : 'text-red-400'
  }

  const getChangeIcon = (type: string) => {
    return type === 'increase' ? TrendingUp : TrendingDown
  }

  const ChangeIcon = getChangeIcon(change?.type || 'increase')

  return (
    <Card 
      variant="premium" 
      className="group relative overflow-hidden hover:scale-[1.02] transition-all duration-500 border border-white/10 hover:border-white/30 bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm"
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getCardGradient(color)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors duration-300">
          {title}
        </CardTitle>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getColorClasses(color)} flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 relative overflow-hidden`}>
          {/* Icon glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(color)} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
          <Icon className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0">
        <div className="space-y-4">
          {/* Main value with enhanced typography */}
          <div className="text-4xl font-bold text-white group-hover:text-white/90 transition-colors duration-300 tracking-tight">
            {value}
          </div>
          
          {/* Change indicator with improved design */}
          {change && (
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gradient-to-r ${
                change.type === 'increase' 
                  ? 'from-green-500/20 to-green-600/20 border border-green-500/30' 
                  : 'from-red-500/20 to-red-600/20 border border-red-500/30'
              } group-hover:scale-105 transition-transform duration-300`}>
                <ChangeIcon className={`w-4 h-4 ${getChangeColor(change.type)}`} />
                <span className={`text-sm font-bold ${getChangeColor(change.type)}`}>
                  {Math.abs(change.value)}%
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium">vs mês anterior</span>
            </div>
          )}
          
          {/* Description with better styling */}
          {description && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-300">
                {description}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  )
}
