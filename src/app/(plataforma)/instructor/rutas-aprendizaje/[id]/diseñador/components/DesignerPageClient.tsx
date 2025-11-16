'use client'

import type React from 'react'
import { useCallback, useTransition } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { toast } from 'sonner'
import { saveLearningPathDesign } from '@/app/(plataforma)/instructor/rutas-aprendizaje/actions'
import { LearningPathDesigner } from '@/components/learning-path-designer/LearningPathDesigner'
import type { DesignerEdge, DesignerNode } from '@/types/learning-path-designer'

interface DesignerPageClientProps {
  learningPathId: string
  learningPath: any
  initialNodes: DesignerNode[]
  initialEdges: DesignerEdge[]
}

export const DesignerPageClient: React.FC<DesignerPageClientProps> = ({ learningPathId, initialNodes, initialEdges }) => {
  const [_isPending, startTransition] = useTransition()

  const handleSave = useCallback(
    (nodes: DesignerNode[], edges: DesignerEdge[]) => {
      startTransition(async () => {
        try {
          await saveLearningPathDesign(learningPathId, nodes, edges)
          toast.success('Ruta guardada exitosamente')
        } catch (error) {
          console.error(error)
          toast.error('Error al guardar la ruta')
        }
      })
    },
    [learningPathId]
  )

  return (
    <ReactFlowProvider>
      <LearningPathDesigner
        learningPathId={learningPathId}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onSave={handleSave}
      />
    </ReactFlowProvider>
  )
}
