'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface AchievementCardProps {
  id: string
  name: string
  description: string
  icon?: string
  progress?: number
  completed?: boolean
  rewardXp?: number
  rewardCoins?: number
  obtainedAt?: Date
  onClick?: () => void
}

export function AchievementCard({
  name,
  description,
  icon,
  progress = 0,
  completed = false,
  rewardXp,
  rewardCoins,
  onClick
}: AchievementCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
        completed ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className='flex gap-4'>
        {icon && (
          <div className='flex-shrink-0'>
            <Image src={icon} alt={name} width={80} height={80} className='rounded-lg' />
          </div>
        )}

        <div className='flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <h3 className='font-bold text-base'>{name}</h3>
              <p className='text-sm text-gray-600 mt-1'>{description}</p>
            </div>
            {completed && <Badge className='bg-green-500'>✓ Completado</Badge>}
          </div>

          {!completed && progress > 0 && (
            <div className='mt-3'>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-gray-600'>Progreso</span>
                <span className='font-semibold'>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className='h-2' />
            </div>
          )}

          {(rewardXp || rewardCoins) && (
            <div className='flex gap-2 mt-3'>
              {rewardXp && (
                <Badge variant='secondary' className='text-xs'>
                  +{rewardXp} XP
                </Badge>
              )}
              {rewardCoins && (
                <Badge variant='secondary' className='text-xs'>
                  +{rewardCoins} 🪙
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
