'use client'

import { Medal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LeaderboardRowProps {
  rank: number
  name: string
  level: number
  xp: number
  coins?: number
  badges?: number
  isCurrentUser?: boolean
}

export function LeaderboardRow({ rank, name, level, xp, coins, badges, isCurrentUser = false }: LeaderboardRowProps) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-gray-400'
  }

  return (
    <div
      className={`
        flex items-center gap-4 p-3 rounded-lg border transition-all
        ${isCurrentUser ? 'bg-purple-50 border-purple-300 font-semibold' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
      `}
    >
      {/* Rank with medal */}
      <div className='flex-shrink-0 w-12 flex items-center justify-center'>
        {rank <= 3 ? (
          <Medal className={`w-6 h-6 ${getMedalColor(rank)}`} />
        ) : (
          <span className='font-bold text-gray-500 text-lg'>#{rank}</span>
        )}
      </div>

      {/* User info */}
      <div className='flex-1'>
        <p className='font-semibold text-sm'>{name}</p>
        <p className='text-xs text-gray-600'>Nivel {level}</p>
      </div>

      {/* Stats */}
      <div className='flex items-center gap-3'>
        {badges !== undefined && (
          <div className='text-center'>
            <p className='text-xs text-gray-600'>Insignias</p>
            <p className='font-semibold text-sm'>{badges}</p>
          </div>
        )}

        {coins !== undefined && (
          <div className='text-center'>
            <p className='text-xs text-gray-600'>Coins</p>
            <p className='font-semibold text-sm'>💰 {coins.toLocaleString()}</p>
          </div>
        )}

        {/* XP (always shown) */}
        <div className='text-center min-w-[70px]'>
          <p className='text-xs text-gray-600'>XP</p>
          <Badge variant='secondary' className='text-sm font-semibold'>
            {xp.toLocaleString()}
          </Badge>
        </div>
      </div>
    </div>
  )
}
