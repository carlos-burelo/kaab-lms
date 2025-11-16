import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLearningPath } from '@/actions/learning-path.actions'
import { LearningPathViewer } from '@/components/learning-paths/LearningPathViewer'

export const metadata: Metadata = {
  title: 'Ruta de Aprendizaje',
  description: 'Sigue tu ruta de aprendizaje personalizada'
}

interface LearningPathPageProps {
  params: {
    id: string
  }
}

export default async function LearningPathPage({ params }: LearningPathPageProps) {
  const result = await getLearningPath(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const learningPath = result.data

  return (
    <div className='container mx-auto px-4 py-8'>
      <LearningPathViewer learningPath={learningPath} />
    </div>
  )
}
