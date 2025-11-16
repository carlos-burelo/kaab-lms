'use client'

import Image from 'next/image'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface BadgeCardProps {
  id: string
  name: string
  description: string
  icon?: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  obtainedAt?: Date
  points?: number
  onClick?: () => void
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-900 border-gray-300',
  uncommon: 'bg-green-100 text-green-900 border-green-300',
  rare: 'bg-blue-100 text-blue-900 border-blue-300',
  epic: 'bg-purple-100 text-purple-900 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-900 border-yellow-300'
}

export function BadgeCard({ name, description, icon, rarity = 'common', obtainedAt, points, onClick }: BadgeCardProps) {
  return (
    <Card
      className={`p-4 text-center cursor-pointer hover:shadow-lg transition-shadow ${rarityColors[rarity]} border`}
      onClick={onClick}
    >
      {icon && (
        <div className='mb-3 flex justify-center'>
          <Image src={icon} alt={name} width={64} height={64} className='rounded-full' />
        </div>
      )}

      <h3 className='font-bold text-sm mb-1'>{name}</h3>
      <p className='text-xs opacity-75 mb-3 line-clamp-2'>{description}</p>

      <div className='flex items-center justify-center gap-2'>
        {points && (
          <BadgeUI variant='secondary' className='text-xs'>
            +{points} XP
          </BadgeUI>
        )}
        {rarity && (
          <BadgeUI variant='outline' className='text-xs capitalize'>
            {rarity}
          </BadgeUI>
        )}
      </div>

      {obtainedAt && <p className='text-xs text-gray-500 mt-2'>Obtenido: {obtainedAt.toLocaleDateString('es-ES')}</p>}
    </Card>
  )
}
