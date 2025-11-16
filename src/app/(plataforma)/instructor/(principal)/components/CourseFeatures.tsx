import { AvatarGroup } from '@/components/extensions/avatar-group'
import { instructorRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export function CourseFeatures() {
  return (
    <div className='grid gap-2 mt-2 sm:grid-cols-3'>
      <TotalStudents />
      {/* <TotalContentItems /> */}
    </div>
  )
}

export async function TotalStudents() {
  const session = await getSession()
  if (!session?.id) {
    return <div>No autorizado</div>
  }

  const totalStudents = await instructorRepository.getMyStudents(session.id)

  if (!totalStudents || totalStudents.length === 0) {
    return (
      <div className='p-4 mt-4 border rounded-md bg-card text-center text-sm text-muted-foreground'>
        No hay estudiantes inscritos en tus cursos aún.
      </div>
    )
  }

  return (
    <div className='p-4 mt-4 border rounded-md bg-card'>
      <h2 className='font-semibold text-lg mb-2'>Usuarios totales</h2>
      <AvatarGroup users={totalStudents} />
    </div>
  )
}
