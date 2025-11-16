import { CourseGrid } from '@/components/course/CourseGrid'
import { studentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export default async function StudentsPage() {
  const session = await getSession()
  if (!session?.id) {
    return <div>No autorizado</div>
  }

  const courses = await studentRepository.getEnrolledCourses(session.id)

  return (
    <div className='p-4'>
      <CourseGrid courses={courses || []} />
    </div>
  )
}
