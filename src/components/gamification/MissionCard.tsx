'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface MissionCardProps {
  id: string
  name: string
  description: string
  icon?: string
  difficulty?: 'fácil' | 'medio' | 'difícil'
  rewardXp?: number
  rewardCoins?: number
  progress?: number
  completed?: boolean
  accepted?: boolean
  expiresAt?: Date
  onAccept?: () => void
  onComplete?: () => void
  loading?: boolean
}

const difficultyColors = {
  fácil: 'bg-green-100 text-green-900',
  medio: 'bg-yellow-100 text-yellow-900',
  difícil: 'bg-red-100 text-red-900'
}

export function MissionCard({
  id,
  name,
  description,
  icon,
  difficulty = 'medio',
  rewardXp,
  rewardCoins,
  progress = 0,
  completed = false,
  accepted = false,
  expiresAt,
  onAccept,
  onComplete,
  loading = false
}: MissionCardProps) {
  return (
    <Card
      className={`p-4 transition-all ${
        completed ? 'border-green-500 bg-green-50' : accepted ? 'border-blue-500 bg-blue-50' : ''
      }`}
    >
      <div className='flex gap-4'>
        {icon && (
          <div className='flex-shrink-0'>
            <Image src={icon} alt={name} width={80} height={80} className='rounded-lg' />
          </div>
        )}

        <div className='flex-1'>
          <div className='flex items-start justify-between gap-2 mb-2'>
            <div>
              <h3 className='font-bold text-base'>{name}</h3>
              <p className='text-sm text-gray-600 mt-1'>{description}</p>
            </div>
            {completed && <Badge className='bg-green-500'>✓ Completada</Badge>}
          </div>

          {difficulty && (
            <div className='flex gap-2 mb-3'>
              <Badge className={difficultyColors[difficulty]} variant='outline'>
                {difficulty}
              </Badge>
            </div>
          )}

          {accepted && !completed && progress > 0 && (
            <div className='mb-3'>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-gray-600'>Progreso</span>
                <span className='font-semibold'>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className='h-2' />
            </div>
          )}

          <div className='flex items-center justify-between'>
            <div className='flex gap-2'>
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

            <div className='flex gap-2'>
              {!accepted && onAccept && (
                <Button size='sm' onClick={onAccept} disabled={loading}>
                  Aceptar
                </Button>
              )}
              {accepted && !completed && onComplete && (
                <Button size='sm' variant='default' onClick={onComplete} disabled={loading}>
                  Completar
                </Button>
              )}
            </div>
          </div>

          {expiresAt && <p className='text-xs text-gray-500 mt-2'>Expira: {expiresAt.toLocaleDateString('es-ES')}</p>}
        </div>
      </div>
    </Card>
  )
}
