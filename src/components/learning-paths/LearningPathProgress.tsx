'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle } from 'lucide-react'

interface Node {
  id: string
  title: string
  nodeType: string
}

interface LearningPathProgressProps {
  nodes: Node[]
  completedNodes: string[]
  currentNodeId?: string
}

export function LearningPathProgress({
  nodes,
  completedNodes,
  currentNodeId
}: LearningPathProgressProps) {
  const getNodeStatus = (nodeId: string) => {
    if (completedNodes.includes(nodeId)) return 'completed'
    if (nodeId === currentNodeId) return 'current'
    return 'pending'
  }

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'current':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />
      case 'current':
        return <Circle className="h-5 w-5" />
      default:
        return <Circle className="h-5 w-5 opacity-50" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estructura de la Ruta</CardTitle>
        <CardDescription>Nodos y progreso a través de la ruta</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {nodes.map((node, index) => {
            const status = getNodeStatus(node.id)
            return (
              <div key={node.id} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getNodeIcon(status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {node.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{node.nodeType}</p>
                </div>
                <Badge className={getNodeColor(status)}>
                  {status === 'completed' ? 'Completado' : status === 'current' ? 'Actual' : 'Pendiente'}
                </Badge>
                {index < nodes.length - 1 && (
                  <div className="absolute left-[22px] w-0.5 h-8 bg-gray-300 -ml-6" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
