'use client'

import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { LevelBadge } from './LevelBadge'

interface GamificationDashboardProps {
  children: ReactNode
  profile?: {
    level: number
    xp: number
    coins: number
  }
  stats?: {
    badges: number
    achievements: number
    missions: number
    rewards: number
  }
}

export function GamificationDashboard({ children, profile, stats }: GamificationDashboardProps) {
  return (
    <div className='space-y-6'>
      {/* Header with profile info */}
      {profile && (
        <Card className='p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white'>
          <div className='flex items-center gap-6'>
            <LevelBadge level={profile.level} xp={profile.xp} size='lg' />

            <div className='flex-1'>
              <h2 className='text-2xl font-bold mb-2'>Hub de Gamificación</h2>
              <p className='text-white/90 mb-3'>¡Sigue avanzando para desbloquear nuevas recompensas!</p>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <p className='text-sm font-semibold opacity-90'>Experiencia</p>
                  <p className='text-lg font-bold'>{profile.xp.toLocaleString()} XP</p>
                </div>
                <div>
                  <p className='text-sm font-semibold opacity-90'>Coins</p>
                  <p className='text-lg font-bold'>💰 {profile.coins.toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-sm font-semibold opacity-90'>Nivel</p>
                  <p className='text-lg font-bold'>{profile.level}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Insignias</p>
            <p className='text-3xl font-bold text-yellow-600'>{stats.badges}</p>
          </Card>
          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Logros</p>
            <p className='text-3xl font-bold text-green-600'>{stats.achievements}</p>
          </Card>
          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Misiones</p>
            <p className='text-3xl font-bold text-blue-600'>{stats.missions}</p>
          </Card>
          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Recompensas</p>
            <p className='text-3xl font-bold text-purple-600'>{stats.rewards}</p>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  )
}
