'use client'

import { Edit, GitBranch, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteLearningPath } from '../actions'

interface LearningPathListProps {
  learningPaths: any[]
}

export const LearningPathList: React.FC<LearningPathListProps> = ({ learningPaths }) => {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta ruta?')) {
      startTransition(async () => {
        try {
          await deleteLearningPath(id)
          toast.success('Ruta eliminada exitosamente')
        } catch (_error) {
          toast.error('Error al eliminar la ruta')
        }
      })
    }
  }

  if (learningPaths.length === 0) {
    return (
      <Card>
        <CardContent className='pt-12'>
          <div className='text-center'>
            <GitBranch className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-900'>No hay rutas de aprendizaje</h3>
            <p className='text-gray-500 mt-2'>Comienza creando tu primera ruta de aprendizaje</p>
            <Link href='/instructor/rutas-aprendizaje/nueva'>
              <Button className='mt-4'>Crear Primera Ruta</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {learningPaths.map((path) => (
        <Card key={path.id} className='overflow-hidden hover:shadow-lg transition-shadow'>
          {/* Image */}
          {path.image && (
            <div className='relative h-40 w-full bg-gray-200'>
              <Image src={path.image.url} alt={path.title} fill className='object-cover' />
            </div>
          )}

          <CardHeader className='pb-3'>
            <CardTitle className='line-clamp-2'>{path.title}</CardTitle>
            <CardDescription className='line-clamp-2'>{path.description}</CardDescription>
          </CardHeader>

          <CardContent className='space-y-3'>
            {/* Stats */}
            <div className='flex gap-2 text-xs text-gray-600'>
              <span className='flex items-center gap-1'>📚 {path.nodes?.length || 0} nodos</span>
              <span className='flex items-center gap-1'>🔗 {path.edges?.length || 0} conexiones</span>
            </div>

            {/* Tags */}
            <div className='flex flex-wrap gap-1'>
              {path.level && (
                <Badge variant='secondary' className='text-xs'>
                  {path.level}
                </Badge>
              )}
              {path.isPublished ? (
                <Badge className='text-xs bg-green-600'>Publicado</Badge>
              ) : (
                <Badge variant='outline' className='text-xs'>
                  Borrador
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className='flex gap-2 pt-2'>
              <Link href={`/instructor/rutas-aprendizaje/${path.id}/diseñador`} className='flex-1'>
                <Button size='sm' variant='outline' className='w-full gap-1'>
                  <Edit className='h-3 w-3' />
                  Diseñar
                </Button>
              </Link>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => handleDelete(path.id)}
                disabled={isPending}
                className='text-red-600 hover:text-red-700 hover:bg-red-50'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
