'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MissionCard } from '@/components/gamification'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { acceptMissionAction, completeMissionAction, getActiveMissionsAction, getCompletedMissionsAction } from '../actions'

export default function MissionsPage() {
  const [activeMissions, setActiveMissions] = useState<any[]>([])
  const [completedMissions, setCompletedMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [activeResult, completedResult] = await Promise.all([getActiveMissionsAction(), getCompletedMissionsAction()])

      if (activeResult.success && activeResult.data) {
        setActiveMissions(activeResult.data)
      }
      if (completedResult.success && completedResult.data) {
        setCompletedMissions(completedResult.data)
      }
      setLoading(false)
    }

    load()
  }, [])

  const handleAcceptMission = async (missionId: string) => {
    setActionLoading(missionId)
    const result = await acceptMissionAction(missionId)
    setActionLoading(null)

    if (result.success) {
      toast.success('Misión aceptada')
      // Refresh missions
      const activeResult = await getActiveMissionsAction()
      if (activeResult.success && activeResult.data) {
        setActiveMissions(activeResult.data)
      }
    } else {
      toast.error('error' in result ? result.error : 'Error')
    }
  }

  const handleCompleteMission = async (missionId: string) => {
    setActionLoading(missionId)
    const result = await completeMissionAction(missionId)
    setActionLoading(null)

    if (result.success) {
      toast.success('Misión completada')
      // Refresh missions
      const [activeResult, completedResult] = await Promise.all([getActiveMissionsAction(), getCompletedMissionsAction()])
      if (activeResult.success && activeResult.data) {
        setActiveMissions(activeResult.data)
      }
      if (completedResult.success && completedResult.data) {
        setCompletedMissions(completedResult.data)
      }
    } else {
      toast.error('error' in result ? result.error : 'Error')
    }
  }

  if (loading) {
    return <div className='text-center py-12'>Cargando misiones...</div>
  }

  const acceptedMissions = activeMissions.filter((m) => m.users?.length > 0)
  const availableMissions = activeMissions.filter((m) => m.users?.length === 0)

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
          <h1 className='text-3xl font-bold'>Misiones</h1>
          <p className='text-gray-600 mt-1'>Completa misiones para ganar XP y coins</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='available' className='w-full'>
        <TabsList>
          <TabsTrigger value='available'>Disponibles ({availableMissions.length})</TabsTrigger>
          <TabsTrigger value='accepted'>Aceptadas ({acceptedMissions.length})</TabsTrigger>
          <TabsTrigger value='completed'>Completadas ({completedMissions.length})</TabsTrigger>
        </TabsList>

        {/* Available */}
        <TabsContent value='available' className='space-y-4'>
          {availableMissions.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>No hay misiones disponibles</h3>
              <p className='text-gray-600'>Vuelve pronto para nuevas misiones</p>
            </div>
          ) : (
            availableMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                id={mission.id}
                name={mission.name}
                description={mission.description}
                icon={mission.image?.url}
                difficulty={mission.difficulty}
                rewardXp={mission.rewardXp}
                rewardCoins={mission.rewardCoins}
                expiresAt={mission.endDate}
                onAccept={() => handleAcceptMission(mission.id)}
                loading={actionLoading === mission.id}
              />
            ))
          )}
        </TabsContent>

        {/* Accepted */}
        <TabsContent value='accepted' className='space-y-4'>
          {acceptedMissions.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>No has aceptado misiones</h3>
              <p className='text-gray-600 mb-4'>Ve a la pestaña "Disponibles" y acepta una misión</p>
              <Button variant='default'>Ver Misiones Disponibles</Button>
            </div>
          ) : (
            acceptedMissions.map((mission) => {
              const userMission = mission.users?.[0]
              return (
                <MissionCard
                  key={mission.id}
                  id={mission.id}
                  name={mission.name}
                  description={mission.description}
                  icon={mission.image?.url}
                  difficulty={mission.difficulty}
                  rewardXp={mission.rewardXp}
                  rewardCoins={mission.rewardCoins}
                  accepted={true}
                  progress={userMission?.progress || 0}
                  expiresAt={mission.endDate}
                  onComplete={() => handleCompleteMission(mission.id)}
                  loading={actionLoading === mission.id}
                />
              )
            })
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value='completed' className='space-y-4'>
          {completedMissions.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>No has completado misiones</h3>
              <p className='text-gray-600'>Completa misiones para ganar recompensas</p>
            </div>
          ) : (
            completedMissions.map((userMission) => (
              <MissionCard
                key={userMission.id}
                id={userMission.mission.id}
                name={userMission.mission.name}
                description={userMission.mission.description}
                icon={userMission.mission.image?.url}
                difficulty={userMission.mission.difficulty}
                rewardXp={userMission.mission.rewardXp}
                rewardCoins={userMission.mission.rewardCoins}
                completed={true}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
