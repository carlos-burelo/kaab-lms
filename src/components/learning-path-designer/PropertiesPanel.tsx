'use client'

import type React from 'react'
import type { Edge, Node } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { NodeData } from '@/types/learning-path-designer'

interface PropertiesPanelProps {
  selectedNodeId?: string
  selectedEdgeId?: string
  node?: Node
  edge?: Edge
  onNodeDataChange: (data: Partial<NodeData>) => void
  onEdgeDataChange: (data: any) => void
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNodeId,
  selectedEdgeId,
  node,
  edge,
  onNodeDataChange,
  onEdgeDataChange
}) => {
  if (!selectedNodeId && !selectedEdgeId) {
    return (
      <div className='w-80 border-l bg-gray-50 p-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Propiedades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-gray-500'>Selecciona un nodo o conexión para editar sus propiedades</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedEdgeId && edge) {
    return (
      <div className='w-80 overflow-y-auto border-l bg-gray-50 p-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Propiedades de Conexión</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label>Etiqueta</Label>
              <Input
                value={typeof edge.label === 'string' ? edge.label : ''}
                onChange={(e) => {
                  onEdgeDataChange({ label: e.target.value })
                }}
                placeholder='ej. Aprobado, Reprobado'
              />
            </div>
            <div>
              <Label>Condición</Label>
              <Textarea
                value={edge.data?.condition || ''}
                onChange={(e) => {
                  onEdgeDataChange({ condition: e.target.value })
                }}
                placeholder='Condición lógica para esta conexión'
                className='h-24'
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedNodeId && node) {
    const nodeType = node.type?.toUpperCase() || 'COURSE'

    return (
      <div className='w-80 overflow-y-auto border-l bg-gray-50 p-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Propiedades del Nodo</CardTitle>
            <div className='mt-2 text-sm font-medium text-gray-600'>Tipo: {nodeType}</div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label>Título</Label>
              <Input
                value={node.data?.label || ''}
                onChange={(e) => {
                  onNodeDataChange({ label: e.target.value })
                }}
                placeholder='Nombre del nodo'
              />
            </div>

            {(nodeType === 'COURSE' || nodeType === 'SYNC' || nodeType === 'DECISION') && (
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={node.data?.description || ''}
                  onChange={(e) => {
                    onNodeDataChange({ description: e.target.value })
                  }}
                  placeholder='Descripción opcional'
                  className='h-20'
                />
              </div>
            )}

            {nodeType === 'COURSE' && (
              <>
                <div>
                  <Label>ID del Curso</Label>
                  <Input
                    value={node.data?.courseId || ''}
                    onChange={(e) => {
                      onNodeDataChange({ courseId: e.target.value })
                    }}
                    placeholder='ID del curso a vincular'
                  />
                </div>
                <div>
                  <Label>Nombre del Curso</Label>
                  <Input
                    value={node.data?.courseName || ''}
                    onChange={(e) => {
                      onNodeDataChange({ courseName: e.target.value })
                    }}
                    placeholder='Nombre visible del curso'
                  />
                </div>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='optional'
                    checked={node.data?.isOptional || false}
                    onCheckedChange={(checked) => {
                      onNodeDataChange({ isOptional: checked === true })
                    }}
                  />
                  <Label htmlFor='optional'>Curso Opcional</Label>
                </div>
              </>
            )}

            {nodeType === 'DECISION' && (
              <>
                <div>
                  <Label>Condición</Label>
                  <Select
                    value={node.data?.condition || 'grade'}
                    onValueChange={(value) => {
                      onNodeDataChange({ condition: value })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='grade'>Por Calificación</SelectItem>
                      <SelectItem value='completion'>Por Finalización</SelectItem>
                      <SelectItem value='time'>Por Tiempo</SelectItem>
                      <SelectItem value='custom'>Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Detalles de la Condición</Label>
                  <Textarea
                    value={node.data?.conditionDetails || ''}
                    onChange={(e) => {
                      onNodeDataChange({ conditionDetails: e.target.value })
                    }}
                    placeholder='Define los criterios de la decisión'
                    className='h-20'
                  />
                </div>
              </>
            )}

            <div className='rounded-lg bg-blue-50 p-3 text-xs text-blue-800'>
              💡 Consejo: Arrastra los nodos en el canvas para cambiar su posición. Las conexiones se mantienen automáticamente.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
