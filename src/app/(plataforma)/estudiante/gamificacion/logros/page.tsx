'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AchievementCard } from '@/components/gamification'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAchievementsAction } from '../actions'

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const result = await getAchievementsAction()
      if (result.success && result.data) {
        setAchievements(result.data)
      }
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <div className='text-center py-12'>Cargando logros...</div>
  }

  const completed = achievements.filter((a) => a.completed)
  const pending = achievements.filter((a) => !a.completed)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link href='/estudiante/gamificacion'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold'>
            Logros ({completed.length}/{achievements.length})
          </h1>
          <p className='text-gray-600 mt-1'>Completa desafíos para desbloquear logros y recompensas</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='all' className='w-full'>
        <TabsList>
          <TabsTrigger value='all'>Todos ({achievements.length})</TabsTrigger>
          <TabsTrigger value='completed'>Completados ({completed.length})</TabsTrigger>
          <TabsTrigger value='pending'>Pendientes ({pending.length})</TabsTrigger>
        </TabsList>

        {/* All */}
        <TabsContent value='all' className='space-y-4'>
          {achievements.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>No hay logros disponibles</h3>
              <p className='text-gray-600'>Los logros aparecerán cuando estén disponibles</p>
            </div>
          ) : (
            achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                id={achievement.id}
                name={achievement.achievement?.name ?? 'Logro'}
                description={achievement.achievement?.description ?? ''}
                icon={achievement.achievement?.image?.url}
                progress={achievement.progress}
                completed={achievement.completed}
                rewardXp={achievement.achievement?.rewardXp}
                rewardCoins={achievement.achievement?.rewardCoins}
                obtainedAt={achievement.obtainedAt}
              />
            ))
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value='completed' className='space-y-4'>
          {completed.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>Aún no completas logros</h3>
              <p className='text-gray-600 mb-4'>¡Completa desafíos para desbloquear tus primeros logros!</p>
              <Link href='/estudiante/gamificacion/misiones'>
                <Button>Ver Misiones</Button>
              </Link>
            </div>
          ) : (
            completed.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                id={achievement.id}
                name={achievement.achievement?.name ?? 'Logro'}
                description={achievement.achievement?.description ?? ''}
                icon={achievement.achievement?.image?.url}
                progress={achievement.progress}
                completed={achievement.completed}
                rewardXp={achievement.achievement?.rewardXp}
                rewardCoins={achievement.achievement?.rewardCoins}
                obtainedAt={achievement.obtainedAt}
              />
            ))
          )}
        </TabsContent>

        {/* Pending */}
        <TabsContent value='pending' className='space-y-4'>
          {pending.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>¡Excelente! Completaste todos los logros</h3>
              <p className='text-gray-600'>Sigue completando misiones para desbloquear más logros</p>
            </div>
          ) : (
            pending.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                id={achievement.id}
                name={achievement.achievement?.name ?? 'Logro'}
                description={achievement.achievement?.description ?? ''}
                icon={achievement.achievement?.image?.url}
                progress={achievement.progress}
                completed={achievement.completed}
                rewardXp={achievement.achievement?.rewardXp}
                rewardCoins={achievement.achievement?.rewardCoins}
                obtainedAt={achievement.obtainedAt}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
