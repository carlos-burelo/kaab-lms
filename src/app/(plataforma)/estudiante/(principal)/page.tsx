import { BadgeCheckIcon, CircleStarIcon, CoinsIcon } from 'lucide-react'
import { getCertificates } from '@/actions/student/certificate.actions'
import { getEnrolledCourses } from '@/actions/student/enrollment.actions'
import { getAchievements, getGamificationProfile } from '@/actions/student/gamification.actions'
import { CoursesInProgress } from './components/CoursesInProgress'
import { NewEnrollment } from './components/NewEnrollment'
import { StudentHintCard } from './components/StudentHintCard'

export default async function Page() {
  // Llamar server actions en paralelo
  const [enrolledResult, gamificationResult, achievementsResult, certificatesResult] = await Promise.all([
    getEnrolledCourses({}),
    getGamificationProfile({}),
    getAchievements({}),
    getCertificates({})
  ])

  // Manejar errores de autenticación
  if (!enrolledResult.success) {
    return <div>No autorizado</div>
  }

  const data = {
    enrollments: (enrolledResult.data as any) || [],
    xp: (gamificationResult.data as any)?.xp || 0,
    insigniasUsuario: (achievementsResult.data as any) || [],
    certificados: (certificatesResult.data as any) || []
  }

  return (
    <div className='p-4'>
      <div className='grid gap-2 sm:grid-cols-1 lg:grid-cols-10 items-center'>
        <div className='lg:col-span-6'>
          <h1 className='text-2xl font-bold'>Good Morning, Audit</h1>
          <p className='text-muted-foreground'>Here is what's happening with your courses today.</p>
        </div>
        <div className='lg:col-span-4 grid grid-cols-3 gap-2'>
          <StudentHintCard icon={<CoinsIcon />} label='Puntos' value={data?.xp || 0} />
          <StudentHintCard icon={<CircleStarIcon />} label='Insignias' value={data?.insigniasUsuario.length || 0} />
          <StudentHintCard icon={<BadgeCheckIcon />} label='Certificados' value={data?.certificados.length || 0} />
        </div>
      </div>
      <div className='grid lg:grid-cols-10 gap-4 mt-8'>
        <div className='lg:col-span-7 grid gap-4'>
          <CoursesInProgress data={data as any} />
          <NewEnrollment />
        </div>
        <div className='lg:col-span-3'>
          <div className='p-4 border border-muted-foreground/20 rounded-lg mt-8 lg:mt-0'>
            <h2 className='font-semibold mb-2'>¿Necesitas ayuda?</h2>
            <p className='text-sm text-muted-foreground'>
              Si tienes alguna duda o necesitas asistencia, no dudes en contactarnos a través de nuestro chat en vivo o
              enviándonos un correo electrónico. ¡Estamos aquí para ayudarte!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
