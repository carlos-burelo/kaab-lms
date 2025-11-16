import Link from 'next/link'
import { CourseCard } from '@/components/course/CourseCard'
import { getEnrolledCourses } from '@/database/contexts/student'

export async function NewEnrollment() {
  const enrolledCourses = await getEnrolledCourses()

  return (
    <section>
      <header className='flex justify-between items-center mb-2'>
        <h2 className='text-lg font-semibold'>Nueva inscripcion</h2>
        <Link href='/estudiante/cursos' className='text-sm text-primary underline'>
          Ver todos
        </Link>
      </header>
      {!enrolledCourses || enrolledCourses.length === 0 ? (
        <div className='text-muted-foreground text-center col-span-3'>No hay cursos disponibles.</div>
      ) : (
        <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr'>
          {enrolledCourses.map((curso) => (
            <CourseCard key={curso.id} course={curso} renderMode='STUDENT' viewMode='grid' />
          ))}
        </div>
      )}
    </section>
  )
}
