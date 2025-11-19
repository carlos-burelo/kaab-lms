'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Node {
  id: string
  title: string
  description: string
  nodeType: 'START' | 'END' | 'COURSE' | 'DECISION' | 'SYNC'
  courseId?: string
  decisionCriteria?: string
  instructions?: string
}

interface NodeViewerProps {
  node: Node
  learningPath: any
  onComplete: (nodeId: string, data?: Record<string, any>) => Promise<void>
  isLoading?: boolean
}

const nodeTypeConfig = {
  START: { label: 'Inicio', color: 'bg-blue-100 text-blue-800', icon: '▶️' },
  END: { label: 'Fin', color: 'bg-green-100 text-green-800', icon: '✓' },
  COURSE: { label: 'Curso', color: 'bg-purple-100 text-purple-800', icon: '📚' },
  DECISION: { label: 'Decisión', color: 'bg-orange-100 text-orange-800', icon: '⚡' },
  SYNC: { label: 'Sincronización', color: 'bg-pink-100 text-pink-800', icon: '🔄' }
}

export function NodeViewer({ node, learningPath, onComplete, isLoading }: NodeViewerProps) {
  const [completionData, setCompletionData] = useState<Record<string, any>>({})
  const config = nodeTypeConfig[node.nodeType as keyof typeof nodeTypeConfig]

  // Para nodos de decisión, mostrar formulario
  if (node.nodeType === 'DECISION') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <CardTitle>{node.title}</CardTitle>
                <CardDescription>{node.description}</CardDescription>
              </div>
            </div>
            <Badge className={config.color}>{config.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {node.decisionCriteria && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Criterio de decisión:</p>
              <p className="text-sm text-muted-foreground">{node.decisionCriteria}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="score">Puntuación (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                placeholder="Ingresa tu puntuación"
                value={completionData.score || ''}
                onChange={(e) =>
                  setCompletionData({ ...completionData, score: parseInt(e.target.value, 10) || 0 })
                }
              />
            </div>

            <div>
              <Label htmlFor="attempts">Intentos</Label>
              <Input
                id="attempts"
                type="number"
                min="1"
                placeholder="Número de intentos"
                value={completionData.attempts || ''}
                onChange={(e) =>
                  setCompletionData({ ...completionData, attempts: parseInt(e.target.value, 10) || 1 })
                }
              />
            </div>
          </div>

          <Button
            onClick={() => onComplete(node.id, completionData)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Continuar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Para nodos de curso
  if (node.nodeType === 'COURSE') {
    const course = learningPath.courses?.find((c: any) => c.id === node.courseId)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <CardTitle>{node.title}</CardTitle>
                <CardDescription>{node.description}</CardDescription>
              </div>
            </div>
            <Badge className={config.color}>{config.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {course && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-medium">{course.title}</p>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </div>
          )}

          {node.instructions && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Instrucciones:</p>
              <p className="text-sm">{node.instructions}</p>
            </div>
          )}

          <Button
            onClick={() => onComplete(node.id)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Completado
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Para nodos de sincronización
  if (node.nodeType === 'SYNC') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <CardTitle>{node.title}</CardTitle>
                <CardDescription>Sincronizando progreso...</CardDescription>
              </div>
            </div>
            <Badge className={config.color}>{config.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{node.description}</p>
          <Button
            onClick={() => onComplete(node.id)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Continuar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Para nodos de inicio/fin
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <CardTitle>{node.title}</CardTitle>
              <CardDescription>{node.description}</CardDescription>
            </div>
          </div>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {node.nodeType === 'START' && (
          <Button onClick={() => onComplete(node.id)} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Comenzar
              </>
            )}
          </Button>
        )}
        {node.nodeType === 'END' && (
          <div className="text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <p className="font-medium">¡Ruta completada!</p>
            <p className="text-sm text-muted-foreground">Has alcanzado el final de esta ruta de aprendizaje</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
