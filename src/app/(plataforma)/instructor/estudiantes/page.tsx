import { getMyStudents } from '@/database/contexts/instructor'
import { columns } from './components/UserColumns'
import { UserDataTable } from './components/UserDataTable'

export default async function Page() {
  const students = await getMyStudents()

  return (
    <div className='p-4'>
      <h1 className='mb-4 text-3xl font-bold'>Gestión de Estudiantes</h1>
      <p className='text-muted-foreground mb-6'>Administra a todos los estudiantes e instructores de la plataforma.</p>
      <UserDataTable columns={columns} data={students || []} />
    </div>
  )
}
