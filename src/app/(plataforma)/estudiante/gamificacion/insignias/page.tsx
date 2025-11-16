import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BadgeCard } from '@/components/gamification'
import { Button } from '@/components/ui/button'
import { studentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Insignias | Kaab',
  description: 'Tus insignias y logros desbloqueados'
}

export default async function BadgesPage() {
  const session = await getSession()

  if (!session?.id) {
    return <div>No autenticado</div>
  }

  const badges = await studentRepository.getBadges(session.id)

  if (!badges) {
    return <div>Error al cargar insignias</div>
  }

  const groupedByRarity = badges.reduce(
    (acc, badge) => {
      const rarity = badge.badge?.rarity ?? 'common'
      if (!acc[rarity]) {
        acc[rarity] = []
      }
      acc[rarity].push(badge)
      return acc
    },
    {} as Record<string, typeof badges>
  )

  const rarityLabels = {
    common: 'Común',
    uncommon: 'Poco Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario'
  }

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
          <h1 className='text-3xl font-bold'>Insignias ({badges.length})</h1>
          <p className='text-gray-600 mt-1'>Todas las insignias que has desbloqueado</p>
        </div>
      </div>

      {/* Empty State */}
      {badges.length === 0 && (
        <div className='text-center py-12'>
          <h3 className='text-lg font-semibold mb-2'>Aún no tienes insignias</h3>
          <p className='text-gray-600 mb-4'>Completa misiones y desafíos para desbloquear insignias y demostrar tus logros</p>
          <Link href='/estudiante/gamificacion/misiones'>
            <Button>Ver Misiones Disponibles</Button>
          </Link>
        </div>
      )}

      {/* Badges by Rarity */}
      {badges.length > 0 && (
        <div className='space-y-8'>
          {Object.entries(groupedByRarity).map(([rarity, badges]) => (
            <div key={rarity}>
              <h2 className='text-xl font-bold mb-4'>{rarityLabels[rarity as keyof typeof rarityLabels]}</h2>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {badges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    id={badge.id}
                    name={badge.badge?.name ?? 'Badge'}
                    description={badge.badge?.description ?? ''}
                    icon={badge.badge?.image?.url}
                    rarity={badge.badge?.rarity as any}
                    points={badge.badge?.points}
                    obtainedAt={badge.obtainedAt}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
