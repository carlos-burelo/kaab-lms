'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RewardCard } from '@/components/gamification'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { claimRewardAction, getAvailableRewardsAction, getClaimedRewardsAction, getGamificationProfileAction } from '../actions'

export default function RewardShopPage() {
  const [availableRewards, setAvailableRewards] = useState<any[]>([])
  const [claimedRewards, setClaimedRewards] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [availableResult, claimedResult, profileResult] = await Promise.all([
        getAvailableRewardsAction(),
        getClaimedRewardsAction(),
        getGamificationProfileAction()
      ])

      if (availableResult.success && availableResult.data) {
        setAvailableRewards(availableResult.data)
      }
      if (claimedResult.success && claimedResult.data) {
        setClaimedRewards(claimedResult.data)
      }
      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data)
      }
      setLoading(false)
    }

    load()
  }, [])

  const handleClaimReward = async (rewardId: string) => {
    setActionLoading(rewardId)
    const result = await claimRewardAction(rewardId)
    setActionLoading(null)

    if (result.success) {
      toast.success('Recompensa reclamada')
      // Refresh data
      const [availableResult, claimedResult, profileResult] = await Promise.all([
        getAvailableRewardsAction(),
        getClaimedRewardsAction(),
        getGamificationProfileAction()
      ])

      if (availableResult.success && availableResult.data) {
        setAvailableRewards(availableResult.data)
      }
      if (claimedResult.success && claimedResult.data) {
        setClaimedRewards(claimedResult.data)
      }
      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data)
      }
    } else {
      toast.error('error' in result ? result.error : 'Error')
    }
  }

  if (loading) {
    return <div className='text-center py-12'>Cargando tienda...</div>
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-6'>
        <Link href='/estudiante/gamificacion'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
        </Link>
        <div className='flex-1'>
          <h1 className='text-3xl font-bold'>Tienda de Recompensas</h1>
          <p className='text-gray-600 mt-1'>Canjea tus coins por recompensas exclusivas</p>
        </div>
        {profile && (
          <div className='text-right bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200'>
            <p className='text-sm text-gray-600'>Coins Disponibles</p>
            <p className='text-2xl font-bold text-yellow-600'>💰 {profile.coins.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue='available' className='w-full'>
        <TabsList>
          <TabsTrigger value='available'>Disponibles ({availableRewards.length})</TabsTrigger>
          <TabsTrigger value='claimed'>Reclamados ({claimedRewards.length})</TabsTrigger>
        </TabsList>

        {/* Available */}
        <TabsContent value='available' className='space-y-4'>
          {availableRewards.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>No hay recompensas disponibles</h3>
              <p className='text-gray-600'>Vuelve pronto para nuevas recompensas</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {availableRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  id={reward.id}
                  name={reward.name}
                  description={reward.description}
                  image={reward.image?.url}
                  coinCost={reward.coinCost}
                  stock={reward.stock}
                  category={reward.category}
                  canAfford={reward.canAfford}
                  onClaim={() => handleClaimReward(reward.id)}
                  loading={actionLoading === reward.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Claimed */}
        <TabsContent value='claimed' className='space-y-4'>
          {claimedRewards.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>Aún no has reclamado recompensas</h3>
              <p className='text-gray-600 mb-4'>Gana coins completando misiones y compra aquí</p>
              <Link href='/estudiante/gamificacion/misiones'>
                <Button>Ver Misiones</Button>
              </Link>
            </div>
          ) : (
            <div className='space-y-4'>
              {claimedRewards.map((userReward) => (
                <div key={userReward.id} className='p-4 bg-green-50 rounded-lg border border-green-200'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h3 className='font-semibold'>{userReward.reward.name}</h3>
                      <p className='text-sm text-gray-600 mt-1'>{userReward.reward.description}</p>
                      <p className='text-xs text-gray-500 mt-2'>
                        Reclamado: {userReward.obtainedAt ? new Date(userReward.obtainedAt).toLocaleDateString('es-ES') : '-'}
                      </p>
                    </div>
                    <span className='text-2xl'>✓</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
