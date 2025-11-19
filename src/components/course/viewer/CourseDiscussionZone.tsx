'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageCircleIcon, MessageSquareIcon, PlusIcon, UserIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createDiscussionThread, getDiscussionThreads } from '@/actions/student/discussion.actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface CourseDiscussionZoneProps {
  courseId: string
}

export function CourseDiscussionZone({ courseId }: CourseDiscussionZoneProps) {
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newThread, setNewThread] = useState({ title: '', description: '' })
  const [creating, setCreating] = useState(false)

  const loadThreads = useCallback(async () => {
    setLoading(true)
    const result = await getDiscussionThreads({ courseId })
    if (result.success) {
      setThreads(result.data || [])
    }
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  const handleCreateThread = async () => {
    if (!newThread.title.trim()) {
      toast.error('El título es requerido')
      return
    }

    setCreating(true)
    const result = await createDiscussionThread({
      courseId,
      title: newThread.title,
      description: newThread.description
    })

    if (result.success) {
      toast.success('Hilo creado exitosamente')
      setNewThread({ title: '', description: '' })
      setIsDialogOpen(false)
      loadThreads()
    } else {
      toast.error(result.error || 'Error al crear hilo')
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>Cargando discusiones...</p>
      </div>
    )
  }

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold'>Foro de Discusión</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size='sm' variant='outline'>
              <PlusIcon className='w-4 h-4 mr-1' />
              Nuevo tema
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo tema</DialogTitle>
              <DialogDescription>Inicia una nueva discusión con tus compañeros</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <div className='text-sm font-medium'>Título</div>
                <Input
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  placeholder='¿Sobre qué quieres hablar?'
                />
              </div>
              <div>
                <div className='text-sm font-medium'>Descripción (opcional)</div>
                <Textarea
                  value={newThread.description}
                  onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                  placeholder='Agrega más detalles...'
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateThread} disabled={creating} className='w-full'>
                {creating ? 'Creando...' : 'Crear tema'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {threads.length === 0 ? (
        <div className='text-center py-8'>
          <MessageCircleIcon className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
          <p className='text-sm text-muted-foreground'>No hay discusiones aún. ¡Sé el primero en iniciar una!</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {threads.map((thread) => (
            <div key={thread.id} className='p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer'>
              <div className='flex items-start gap-2'>
                {thread.isPinned && <div className='w-1 h-full bg-primary rounded-full' />}
                <div className='flex-1 min-w-0'>
                  <h4 className='font-medium text-sm truncate'>{thread.title}</h4>
                  {thread.description && <p className='text-xs text-muted-foreground line-clamp-1 mt-1'>{thread.description}</p>}
                  <div className='flex items-center gap-3 mt-2 text-xs text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <UserIcon className='w-3 h-3' />
                      <span>{thread.user?.profile?.name || 'Usuario'}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <MessageSquareIcon className='w-3 h-3' />
                      <span>{thread._count?.posts || 0} respuestas</span>
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(thread.createdAt), {
                        addSuffix: true,
                        locale: es
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
