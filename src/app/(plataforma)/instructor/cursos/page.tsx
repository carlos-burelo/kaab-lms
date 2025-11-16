import { CourseGrid } from '@/components/course/CourseGrid'
import { Button } from '@/components/ui/button'
import { instructorRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export default async function CoursesPage() {
  const session = await getSession()
  if (!session?.id) {
    return <div>No autorizado</div>
  }

  const cursos = await instructorRepository.getMyCourses(session.id)

  return (
    <div className='p-4'>
      <header className='mb-6 flex items-center justify-between space-y-2'>
        <div className='grid'>
          <h1 className='text-2xl font-bold'>Mis Cursos</h1>
          <p className='text-muted-foreground'>Administra los cursos que has creado.</p>
        </div>
        <Button asChild>
          <a href='/instructor/cursos/nuevo'>Crear Nuevo Curso</a>
        </Button>
      </header>
      <CourseGrid courses={cursos || []} renderMode='INSTRUCTOR' />
    </div>
  )
}
