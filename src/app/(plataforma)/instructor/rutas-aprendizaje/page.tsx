import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { instructorRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'
import { LearningPathList } from './components/LearningPathList'

export default async function LearningPathsPage() {
  const session = await getSession()
  const learningPaths = await instructorRepository.getLearningPaths(session?.id)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Rutas de Aprendizaje</h1>
          <p className='text-gray-600 mt-1'>Crea y diseña rutas de aprendizaje personalizadas para tus estudiantes</p>
        </div>
        <Link href='/instructor/rutas-aprendizaje/nueva'>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            Nueva Ruta
          </Button>
        </Link>
      </div>

      {/* Learning Paths List */}
      <LearningPathList learningPaths={learningPaths} />
    </div>
  )
}
