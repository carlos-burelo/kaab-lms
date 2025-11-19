import { ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { LeaderboardRow, LevelBadge } from '@/components/gamification'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { studentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Leaderboard | Kaab',
  description: 'Ranking global de estudiantes'
}

export default async function LeaderboardPage() {
  const session = await getSession()

  const [leaderboard, currentUserProfile] = await Promise.all([
    studentRepository.getLeaderboard(100),
    session?.id ? studentRepository.getGamificationProfile(session.id) : null
  ])

  if (!leaderboard) {
    return <div>Error al cargar leaderboard</div>
  }

  const currentUserRank = leaderboard.findIndex((u) => u.userId === session?.id) + 1

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link href='/estudiante/gamificacion'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
        </Link>
        <div className='flex-1'>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <TrendingUp className='w-8 h-8' />
            Ranking Global
          </h1>
          <p className='text-gray-600 mt-1'>Compite con otros estudiantes y sube en el ranking</p>
        </div>
      </div>

      {/* Current User Position */}
      {currentUserProfile && currentUserRank > 0 && (
        <Card className='p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white'>
          <div className='flex items-center gap-6'>
            <LevelBadge level={currentUserProfile.level} xp={currentUserProfile.xp} size='lg' />

            <div className='flex-1'>
              <h3 className='text-lg font-semibold mb-2'>Tu Posición en el Ranking</h3>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <p className='text-sm opacity-90'>Puesto</p>
                  <p className='text-3xl font-bold'>#{currentUserRank}</p>
                </div>
                <div>
                  <p className='text-sm opacity-90'>Puntos XP</p>
                  <p className='text-3xl font-bold'>{currentUserProfile.xp.toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-sm opacity-90'>Nivel</p>
                  <p className='text-3xl font-bold'>{currentUserProfile.level}</p>
                </div>
              </div>
            </div>

            <div className='text-right text-white/90'>
              <p className='text-sm'>¡Sigue completando misiones para subir de puesto!</p>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Table */}
      <div className='space-y-3'>
        <h2 className='text-xl font-bold'>Top 100 Estudiantes</h2>

        {leaderboard.length === 0 ? (
          <div className='text-center py-12 bg-gray-50 rounded-lg'>
            <p className='text-gray-600'>No hay datos de leaderboard disponibles</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {leaderboard.map((entry, index) => (
              <LeaderboardRow
                key={entry.userId}
                rank={index + 1}
                name={entry.user?.profile?.name ? entry.user.profile.name : (entry.user?.email ?? 'Estudiante')}
                level={entry.level}
                xp={entry.xp}
                coins={entry.coins}
                badges={0} // Could be fetched separately if needed
                isCurrentUser={entry.userId === session?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <Card className='p-6 bg-blue-50 border-blue-200'>
        <h3 className='font-bold text-lg mb-3 text-blue-900'>Cómo Subir en el Ranking</h3>
        <ul className='space-y-2 text-sm text-blue-900'>
          <li className='flex gap-2'>
            <span className='font-bold'>1.</span>
            <span>Completa misiones diarias para ganar XP constantemente</span>
          </li>
          <li className='flex gap-2'>
            <span className='font-bold'>2.</span>
            <span>Desbloquea insignias y logros para bonificaciones adicionales</span>
          </li>
          <li className='flex gap-2'>
            <span className='font-bold'>3.</span>
            <span>Comparte tus logros y inspira a otros estudiantes</span>
          </li>
          <li className='flex gap-2'>
            <span className='font-bold'>4.</span>
            <span>Mantén una racha consistente - ¡la constancia es clave!</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
