'use client'

import { CheckCircle, Play } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { completeNode, getLearningPathProgress, getNextNode, startLearningPath } from '@/actions/learning-path.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LearningPathProgress } from './LearningPathProgress'
import { NodeViewer } from './NodeViewer'

interface Node {
  id: string
  title: string
  description: string
  nodeType: 'START' | 'END' | 'COURSE' | 'DECISION' | 'SYNC'
  courseId?: string
  decisionCriteria?: string
}

interface LearningPathViewerProps {
  learningPath: any
  onComplete?: () => void
}

export function LearningPathViewer({ learningPath, onComplete }: LearningPathViewerProps) {
  const [progress, setProgress] = useState<any>(null)
  const [currentNode, setCurrentNode] = useState<Node | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarted, setIsStarted] = useState(false)

  const loadProgress = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getLearningPathProgress(learningPath.id)
      if (result.success && result.data) {
        setProgress(result.data)
        setIsStarted(true)
        if (result.data.currentNodeId) {
          const node = learningPath.nodes?.find((n: any) => n.id === result.data.currentNodeId)
          setCurrentNode(node)
        }
      } else {
        setProgress(null)
        setIsStarted(false)
      }
    } catch (_error) {
      toast.error('No se pudo cargar el progreso')
    } finally {
      setIsLoading(false)
    }
  }, [learningPath.id, learningPath.nodes])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  async function handleStart() {
    setIsLoading(true)
    try {
      const result = await startLearningPath(learningPath.id)
      if (result.success) {
        setProgress(result.data)
        setIsStarted(true)
        const startNode = learningPath.nodes?.find((n: any) => n.nodeType === 'START')
        if (startNode) {
          setCurrentNode(startNode)
        }
        toast.success('Has iniciado la ruta de aprendizaje')
      } else {
        toast.error(result.error)
      }
    } catch (_error) {
      toast.error('Error al iniciar la ruta de aprendizaje')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleNodeComplete(nodeId: string, completionData?: Record<string, any>) {
    setIsLoading(true)
    try {
      const result = await completeNode({
        learningPathId: learningPath.id,
        nodeId,
        completionData
      })

      if (result.success) {
        setProgress(result.data)

        // Obtener siguiente nodo
        const nextResult = await getNextNode({
          learningPathId: learningPath.id,
          currentNodeId: nodeId,
          completionData
        })

        if (nextResult.success) {
          if (nextResult.data?.nextNode) {
            setCurrentNode({ ...nextResult.data.nextNode, description: nextResult.data.nextNode.description || '' })
          } else if (nextResult?.data?.isCompleted) {
            setProgress({ ...result.data, status: 'COMPLETED' })
            toast.success('¡Felicidades! Has completado la ruta de aprendizaje')
            if (onComplete) onComplete()
          }
        }
      } else {
        toast.error(result.error)
      }
    } catch (_error) {
      toast.error('Error al completar el nodo')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !isStarted) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center h-96'>
          <p className='text-muted-foreground'>Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  if (!isStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{learningPath.title}</CardTitle>
          <CardDescription>{learningPath.description}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h4 className='font-medium mb-2'>Información de la ruta:</h4>
            <ul className='space-y-2 text-sm'>
              <li className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                {learningPath.nodes?.length || 0} nodos
              </li>
              <li className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                Instructor: {learningPath.instructor?.profile?.name}
              </li>
            </ul>
          </div>
          <Button onClick={handleStart} disabled={isLoading} className='w-full'>
            <Play className='h-4 w-4 mr-2' />
            Iniciar Ruta
          </Button>
        </CardContent>
      </Card>
    )
  }

  const completionPercentage = progress ? ((progress.completedNodes?.length || 0) / (learningPath.nodes?.length || 1)) * 100 : 0

  return (
    <div className='space-y-4'>
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>{learningPath.title}</CardTitle>
              <CardDescription>{progress?.status === 'COMPLETED' ? 'Completado' : 'En progreso'}</CardDescription>
            </div>
            <Badge variant={progress?.status === 'COMPLETED' ? 'default' : 'secondary'}>
              {progress?.completedNodes?.length || 0} / {learningPath.nodes?.length || 0}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <div className='flex justify-between text-sm mb-2'>
              <span>Progreso general</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} />
          </div>
        </CardContent>
      </Card>

      {/* Current Node */}
      {currentNode && (
        <NodeViewer node={currentNode} learningPath={learningPath} onComplete={handleNodeComplete} isLoading={isLoading} />
      )}

      {/* Learning Path Structure */}
      <LearningPathProgress
        nodes={learningPath.nodes}
        completedNodes={progress?.completedNodes || []}
        currentNodeId={currentNode?.id}
      />
    </div>
  )
}
