import { redirect } from 'next/navigation'
import { instructorRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'
import type { DesignerEdge, DesignerNode } from '@/types/learning-path-designer'
import { DesignerPageClient } from './components/DesignerPageClient'

export default async function LearningPathDesignerPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  // La validación de rol se hace en proxy.ts
  const learningPath = await instructorRepository.getLearningPathDetail(params.id, session?.id)

  // Verificar que el usuario es el propietario de la ruta
  if (!learningPath || learningPath.instructor.userId !== session?.id) {
    redirect('/instructor/rutas-aprendizaje')
  }

  // Convert to DesignerNode format
  const designerNodes: DesignerNode[] = (learningPath.nodes || []).map((node: any) => ({
    id: node.id,
    type: node.nodeType,
    title: node.title,
    description: node.description,
    position: node.position,
    data: node.data,
    isOptional: node.isOptional
  }))

  // Convert to DesignerEdge format
  const designerEdges: DesignerEdge[] = (learningPath.edges || []).map((edge: any) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    label: edge.label,
    condition: edge.condition
  }))

  return (
    <DesignerPageClient
      learningPathId={learningPath.id}
      learningPath={learningPath}
      initialNodes={designerNodes}
      initialEdges={designerEdges}
    />
  )
}
