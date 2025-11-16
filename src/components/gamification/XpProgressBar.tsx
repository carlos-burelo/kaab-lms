'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface XpProgressBarProps {
  current: number
  required: number
  remaining: number
  progress: number
  level: number
  showLabel?: boolean
}

export function XpProgressBar({ current, required, remaining, progress, level, showLabel = true }: XpProgressBarProps) {
  return (
    <Card className='p-4 bg-gradient-to-r from-purple-500 to-pink-500'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-semibold text-white'>Nivel {level}</h3>
            {showLabel && (
              <p className='text-xs text-white/80 mt-1'>
                {current.toLocaleString()} / {required.toLocaleString()} XP
              </p>
            )}
          </div>
          <div className='text-right'>
            <p className='text-xs text-white/80'>{Math.round(progress)}%</p>
            <p className='text-xs font-semibold text-white'>{remaining.toLocaleString()} XP remaining</p>
          </div>
        </div>
        <Progress value={progress} className='h-2' />
      </div>
    </Card>
  )
}
