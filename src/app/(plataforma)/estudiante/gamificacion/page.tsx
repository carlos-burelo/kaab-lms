import { Gift, Star, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { GamificationDashboard, XpProgressBar } from '@/components/gamification'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { studentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Hub de Gamificación | Kaab',
  description: 'Sigue tu progreso, insignias, logros y misiones'
}

export default async function GamificationPage() {
  const session = await getSession()

  if (!session?.id) {
    return <div>No autenticado</div>
  }

  // Fetch all gamification data in parallel
  const [profile, badges, achievements, activeMissions, xpProgress] = await Promise.all([
    studentRepository.getGamificationProfile(session.id),
    studentRepository.getBadges(session.id),
    studentRepository.getAchievements(session.id),
    studentRepository.getActiveMissions(session.id),
    studentRepository.getXpForNextLevel(session.id)
  ])

  if (!profile) {
    return <div>Error al cargar perfil de gamificación</div>
  }

  const stats = {
    badges: badges?.length ?? 0,
    achievements: achievements?.filter((a) => a.completed).length ?? 0,
    missions: activeMissions?.length ?? 0,
    rewards: 0 // Will be fetched separately if needed
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold'>Hub de Gamificación</h1>
        <p className='text-gray-600 mt-1'>Sigue tu progreso y desbloquea nuevas recompensas</p>
      </div>

      {/* Dashboard with stats */}
      <GamificationDashboard
        profile={{
          level: profile.level,
          xp: profile.xp,
          coins: profile.coins
        }}
        stats={stats}
      >
        {/* XP Progress */}
        {xpProgress && (
          <XpProgressBar
            current={xpProgress.current}
            required={xpProgress.required}
            remaining={xpProgress.remaining}
            progress={xpProgress.progress}
            level={profile.level}
          />
        )}
      </GamificationDashboard>

      {/* Navigation Tabs */}
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Resumen</TabsTrigger>
          <TabsTrigger value='badges'>Insignias</TabsTrigger>
          <TabsTrigger value='achievements'>Logros</TabsTrigger>
          <TabsTrigger value='missions'>Misiones</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Quick Stats */}
            <div className='space-y-4'>
              <h3 className='font-bold text-lg flex items-center gap-2'>
                <Trophy className='w-5 h-5' />
                Tus Logros
              </h3>

              <div className='grid grid-cols-2 gap-2'>
                <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                  <p className='text-sm text-gray-600'>Insignias Obtenidas</p>
                  <p className='text-2xl font-bold text-blue-600'>{stats.badges}</p>
                </div>
                <div className='p-4 bg-green-50 rounded-lg border border-green-200'>
                  <p className='text-sm text-gray-600'>Logros Completados</p>
                  <p className='text-2xl font-bold text-green-600'>{stats.achievements}</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className='space-y-4'>
              <h3 className='font-bold text-lg flex items-center gap-2'>
                <Zap className='w-5 h-5' />
                Acciones Rápidas
              </h3>

              <div className='space-y-2'>
                <Link href='/estudiante/gamificacion/misiones'>
                  <Button variant='outline' className='w-full justify-start'>
                    <Zap className='w-4 h-4 mr-2' />
                    Ver Misiones Activas ({stats.missions})
                  </Button>
                </Link>
                <Link href='/estudiante/gamificacion/tienda'>
                  <Button variant='outline' className='w-full justify-start'>
                    <Gift className='w-4 h-4 mr-2' />
                    Tienda de Recompensas
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Ranking Preview */}
          <div className='border-t pt-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold text-lg flex items-center gap-2'>
                <Star className='w-5 h-5' />
                Leaderboard Global
              </h3>
              <Link href='/estudiante/gamificacion/leaderboard'>
                <Button variant='ghost' size='sm'>
                  Ver todo →
                </Button>
              </Link>
            </div>
            <p className='text-sm text-gray-600'>
              Compite con otros estudiantes y sube en el ranking global. ¡Gana más XP completando lecciones y misiones!
            </p>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value='badges'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='font-bold text-lg'>Insignias Obtenidas ({stats.badges})</h3>
              <Link href='/estudiante/gamificacion/insignias'>
                <Button variant='ghost'>Ver todas →</Button>
              </Link>
            </div>
            {badges && badges.length > 0 ? (
              <p className='text-sm text-gray-600'>Accede a la página de insignias para ver todas tus logros desbloqueados</p>
            ) : (
              <p className='text-sm text-gray-600'>Aún no tienes insignias. ¡Completa misiones para desbloquearlas!</p>
            )}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value='achievements'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='font-bold text-lg'>Logros Completados ({stats.achievements})</h3>
              <Link href='/estudiante/gamificacion/logros'>
                <Button variant='ghost'>Ver todos →</Button>
              </Link>
            </div>
            {achievements && achievements.length > 0 ? (
              <p className='text-sm text-gray-600'>Accede a la página de logros para ver tu progreso en todos ellos</p>
            ) : (
              <p className='text-sm text-gray-600'>Completa desafíos para desbloquear logros y obtener recompensas</p>
            )}
          </div>
        </TabsContent>

        {/* Missions Tab */}
        <TabsContent value='missions'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='font-bold text-lg'>Misiones Activas ({stats.missions})</h3>
              <Link href='/estudiante/gamificacion/misiones'>
                <Button variant='ghost'>Ver todas →</Button>
              </Link>
            </div>
            {activeMissions && activeMissions.length > 0 ? (
              <p className='text-sm text-gray-600'>Tienes misiones activas esperándote. ¡Complétalas para ganar XP y coins!</p>
            ) : (
              <p className='text-sm text-gray-600'>No hay misiones activas en este momento</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
