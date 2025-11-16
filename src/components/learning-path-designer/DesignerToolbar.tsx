'use client'

import { BookOpen, ChevronDown, Circle, GitBranch, GitMerge, Plus, Save, Trash2 } from 'lucide-react'
import type React from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface DesignerToolbarProps {
  onAddNode: (type: string, label: string) => void
  onDelete: () => void
  onSave: () => void
  canDelete: boolean
}

const nodeTypes = [
  {
    type: 'start',
    label: 'Inicio',
    icon: Circle,
    description: 'Punto de inicio de la ruta'
  },
  {
    type: 'course',
    label: 'Curso',
    icon: BookOpen,
    description: 'Agregar un curso'
  },
  {
    type: 'decision',
    label: 'Decisión',
    icon: GitBranch,
    description: 'Punto de ramificación'
  },
  {
    type: 'sync',
    label: 'Sincronizar',
    icon: GitMerge,
    description: 'Sincronizar múltiples caminos'
  },
  {
    type: 'end',
    label: 'Fin',
    icon: Circle,
    description: 'Punto final de la ruta'
  }
]

export const DesignerToolbar: React.FC<DesignerToolbarProps> = ({ onAddNode, onDelete, onSave, canDelete }) => {
  return (
    <div className='flex items-center gap-2 border-b bg-white p-4 shadow-sm'>
      {/* Add Node Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='default' size='sm' className='gap-2'>
            <Plus className='h-4 w-4' />
            Agregar Nodo
            <ChevronDown className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-48'>
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon
            return (
              <DropdownMenuItem
                key={nodeType.type}
                onClick={() => onAddNode(nodeType.type, nodeType.label)}
                className='flex cursor-pointer items-center gap-2'
              >
                <Icon className='h-4 w-4' />
                <div>
                  <div className='font-medium'>{nodeType.label}</div>
                  <div className='text-xs text-gray-500'>{nodeType.description}</div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Separator */}
      <div className='h-6 w-px bg-gray-300' />

      {/* Delete Button */}
      <Button variant='outline' size='sm' onClick={onDelete} disabled={!canDelete} className='gap-2'>
        <Trash2 className='h-4 w-4' />
        Eliminar
      </Button>

      {/* Spacer */}
      <div className='flex-1' />

      {/* Save Button */}
      <Button variant='default' size='sm' onClick={onSave} className='gap-2 bg-green-600 hover:bg-green-700'>
        <Save className='h-4 w-4' />
        Guardar Ruta
      </Button>

      {/* Help Text */}
      <div className='ml-4 text-xs text-gray-500'>Ctrl+S para guardar | Eliminar para borrar | Arrastra nodos para mover</div>
    </div>
  )
}
