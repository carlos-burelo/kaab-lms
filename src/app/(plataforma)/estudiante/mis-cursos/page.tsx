import { getEnrolledCourses } from '@/actions/student/enrollment.actions'
import { EmptyState } from '@/components/ui/empty'
import { BookMarkedIcon } from 'lucide-react'
import { EnrolledCoursesList } from './components/EnrolledCoursesList'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Mis Cursos - KAAB LMS',
  description: 'Gestiona tus cursos inscritos y visualiza tu progreso'
}

export default async function MisCursosPage() {
  const result = await getEnrolledCourses({})

  if (!result.success) {
    redirect('/sign-in')
  }

  const enrollments = result.data || []

  return (
    <div className='p-4 lg:p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Mis Cursos</h1>
        <p className='text-muted-foreground mt-2'>
          Gestiona tus cursos inscritos y continúa tu aprendizaje
        </p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={<BookMarkedIcon className='w-16 h-16' />}
          title='No tienes cursos inscritos'
          description='Explora el catálogo de cursos y comienza tu aprendizaje'
          actionLabel='Explorar cursos'
          actionHref='/estudiante/cursos'
        />
      ) : (
        <EnrolledCoursesList enrollments={enrollments} />
      )}
    </div>
  )
}
