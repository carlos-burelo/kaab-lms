'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface RewardCardProps {
  id: string
  name: string
  description: string
  image?: string
  coinCost: number
  stock?: number
  category?: string
  canAfford?: boolean
  claimed?: boolean
  onClaim?: () => void
  loading?: boolean
}

export function RewardCard({
  name,
  description,
  image,
  coinCost,
  stock,
  category,
  canAfford = false,
  claimed = false,
  onClaim,
  loading = false
}: RewardCardProps) {
  const isOutOfStock = stock !== null && stock !== undefined && stock <= 0

  return (
    <Card className={`p-4 transition-all ${claimed ? 'border-green-500 bg-green-50' : isOutOfStock ? 'opacity-50' : ''}`}>
      {image && (
        <div className='mb-3 relative h-40 w-full overflow-hidden rounded-lg bg-gray-100'>
          <Image src={image} alt={name} fill className='object-cover' />
        </div>
      )}

      <h3 className='font-bold text-sm'>{name}</h3>
      <p className='text-xs text-gray-600 mt-1 line-clamp-2'>{description}</p>

      {category && (
        <Badge variant='outline' className='mt-2 text-xs'>
          {category}
        </Badge>
      )}

      <div className='mt-3 space-y-2'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-semibold text-yellow-600'>💰 {coinCost}</span>
          {stock !== null && <span className='text-xs text-gray-500'>Stock: {stock}</span>}
        </div>

        {claimed && <Badge className='w-full justify-center bg-green-500'>✓ Reclamado</Badge>}

        {!claimed && onClaim && (
          <Button
            size='sm'
            className='w-full'
            onClick={onClaim}
            disabled={!canAfford || isOutOfStock || loading}
            variant={canAfford && !isOutOfStock ? 'default' : 'outline'}
          >
            {isOutOfStock ? 'Agotado' : !canAfford ? 'Sin coins' : 'Reclamar'}
          </Button>
        )}
      </div>
    </Card>
  )
}
