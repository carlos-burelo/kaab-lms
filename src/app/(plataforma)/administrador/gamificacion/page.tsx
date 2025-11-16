import { Gift, Star, Trophy, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { adminRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Gamificación Admin | Kaab',
  description: 'Panel de administración de gamificación'
}

export default async function AdminGamificationPage() {
  const session = await getSession()

  if (!session || session.role !== 'ADMIN') {
    return <div>No autorizado</div>
  }

  const [stats, badges, achievements, missions, rewards] = await Promise.all([
    adminRepository.getGamificationStatistics(),
    adminRepository.getBadges(),
    adminRepository.getAchievements(),
    adminRepository.getMissions(),
    adminRepository.getRewards()
  ])

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold flex items-center gap-2'>
          <Trophy className='w-8 h-8' />
          Panel de Gamificación
        </h1>
        <p className='text-gray-600 mt-1'>Gestiona insignias, logros, misiones y recompensas</p>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Insignias</p>
            <p className='text-3xl font-bold text-yellow-600'>{stats.totalBadges}</p>
            <Link href='/administrador/gamificacion/insignias'>
              <Button variant='ghost' size='sm' className='w-full mt-2'>
                Gestionar
              </Button>
            </Link>
          </Card>

          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Logros</p>
            <p className='text-3xl font-bold text-green-600'>{stats.totalAchievements}</p>
            <Link href='/administrador/gamificacion/logros'>
              <Button variant='ghost' size='sm' className='w-full mt-2'>
                Gestionar
              </Button>
            </Link>
          </Card>

          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Misiones</p>
            <p className='text-3xl font-bold text-blue-600'>{stats.totalMissions}</p>
            <Link href='/administrador/gamificacion/misiones'>
              <Button variant='ghost' size='sm' className='w-full mt-2'>
                Gestionar
              </Button>
            </Link>
          </Card>

          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Recompensas</p>
            <p className='text-3xl font-bold text-purple-600'>{stats.totalRewards}</p>
            <Link href='/administrador/gamificacion/tienda'>
              <Button variant='ghost' size='sm' className='w-full mt-2'>
                Gestionar
              </Button>
            </Link>
          </Card>

          <Card className='p-4 text-center'>
            <p className='text-gray-600 text-sm'>Nivel Promedio</p>
            <p className='text-3xl font-bold text-indigo-600'>{Math.round(stats.xpStatistics.averageLevel)}</p>
            <p className='text-xs text-gray-500 mt-2'>XP Máx: {stats.xpStatistics.maxXp.toLocaleString()}</p>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card className='p-6'>
          <h3 className='font-bold text-lg flex items-center gap-2 mb-4'>
            <Star className='w-5 h-5' />
            Insignias ({badges?.length ?? 0})
          </h3>
          <p className='text-gray-600 text-sm mb-4'>Crea y gestiona las insignias que los estudiantes pueden desbloquear</p>
          <Link href='/administrador/gamificacion/insignias'>
            <Button className='w-full'>Ver y Gestionar Insignias</Button>
          </Link>
        </Card>

        <Card className='p-6'>
          <h3 className='font-bold text-lg flex items-center gap-2 mb-4'>
            <Trophy className='w-5 h-5' />
            Logros ({achievements?.length ?? 0})
          </h3>
          <p className='text-gray-600 text-sm mb-4'>Define logros especiales con recompensas de XP y coins</p>
          <Link href='/administrador/gamificacion/logros'>
            <Button className='w-full'>Ver y Gestionar Logros</Button>
          </Link>
        </Card>

        <Card className='p-6'>
          <h3 className='font-bold text-lg flex items-center gap-2 mb-4'>
            <Zap className='w-5 h-5' />
            Misiones ({missions?.length ?? 0})
          </h3>
          <p className='text-gray-600 text-sm mb-4'>Crea misiones con fechas de inicio y fin, dificultad y recompensas</p>
          <Link href='/administrador/gamificacion/misiones'>
            <Button className='w-full'>Ver y Gestionar Misiones</Button>
          </Link>
        </Card>

        <Card className='p-6'>
          <h3 className='font-bold text-lg flex items-center gap-2 mb-4'>
            <Gift className='w-5 h-5' />
            Tienda de Recompensas ({rewards?.length ?? 0})
          </h3>
          <p className='text-gray-600 text-sm mb-4'>Gestiona recompensas que los estudiantes pueden comprar con coins</p>
          <Link href='/administrador/gamificacion/tienda'>
            <Button className='w-full'>Ver y Gestionar Recompensas</Button>
          </Link>
        </Card>
      </div>

      {/* XP Statistics */}
      {stats && (
        <Card className='p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'>
          <h3 className='font-bold text-lg flex items-center gap-2 mb-4'>
            <Users className='w-5 h-5' />
            Estadísticas de Experiencia
          </h3>

          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <div>
              <p className='text-gray-600 text-sm'>XP Promedio</p>
              <p className='text-2xl font-bold text-blue-600'>{Math.round(stats.xpStatistics.averageXp).toLocaleString()}</p>
            </div>
            <div>
              <p className='text-gray-600 text-sm'>XP Máximo</p>
              <p className='text-2xl font-bold text-blue-600'>{stats.xpStatistics.maxXp.toLocaleString()}</p>
            </div>
            <div>
              <p className='text-gray-600 text-sm'>Nivel Promedio</p>
              <p className='text-2xl font-bold text-purple-600'>{Math.round(stats.xpStatistics.averageLevel)}</p>
            </div>
            <div>
              <p className='text-gray-600 text-sm'>Nivel Máximo</p>
              <p className='text-2xl font-bold text-purple-600'>{stats.xpStatistics.maxLevel}</p>
            </div>
            <div>
              <p className='text-gray-600 text-sm'>Coins Promedio</p>
              <p className='text-2xl font-bold text-yellow-600'>{Math.round(stats.xpStatistics.averageCoins).toLocaleString()}</p>
            </div>
            <div>
              <p className='text-gray-600 text-sm'>Coins Máximo</p>
              <p className='text-2xl font-bold text-yellow-600'>{stats.xpStatistics.maxCoins.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className='p-6 bg-green-50 border-green-200'>
        <h3 className='font-bold text-lg mb-3 text-green-900'>Consejos para Gamificación Efectiva</h3>
        <ul className='space-y-2 text-sm text-green-900'>
          <li className='flex gap-2'>
            <span>✓</span>
            <span>Crea insignias para hitos significativos (ej: completar 1er curso, 10 misiones, etc)</span>
          </li>
          <li className='flex gap-2'>
            <span>✓</span>
            <span>Establece misiones semanales o mensuales para mantener a los estudiantes comprometidos</span>
          </li>
          <li className='flex gap-2'>
            <span>✓</span>
            <span>Ofrece recompensas valiosas pero con costo justo de coins</span>
          </li>
          <li className='flex gap-2'>
            <span>✓</span>
            <span>Ajusta puntos de XP para mantener equilibrio entre dificultad y recompensa</span>
          </li>
          <li className='flex gap-2'>
            <span>✓</span>
            <span>Revisa el leaderboard regularmente para identificar estudiantes destacados</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
