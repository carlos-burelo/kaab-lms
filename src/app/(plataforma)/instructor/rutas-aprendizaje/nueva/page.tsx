import { getSession } from '@/lib/auth'
import { NewLearningPathForm } from './components/NewLearningPathForm'

export default async function NewLearningPathPage() {
  const session = await getSession()

  // La validación de rol se hace en proxy.ts

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Nueva Ruta de Aprendizaje</h1>
        <p className='text-gray-600 mt-1'>Crea los detalles básicos de tu ruta. Después podrás diseñarla visualmente.</p>
      </div>

      <NewLearningPathForm userId={session?.id} />
    </div>
  )
}
