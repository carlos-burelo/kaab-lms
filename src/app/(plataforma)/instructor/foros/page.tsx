'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Lock, MessageSquare, Pin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { getDiscussionThreads } from '@/actions/instructor/forum.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Thread = {
  id: string
  title: string
  user: { profile: { name: string } }
  course: { title: string }
  isClosed: boolean
  isPinned: boolean
  views: number
  _count: { posts: number }
  createdAt: Date
}

export default function ForumsPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadThreads = useCallback(async () => {
    const result = await getDiscussionThreads({})
    if (result.success && result.data) {
      setThreads(result.data as any)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  return (
    <>
      <header className='border-b border-border p-4'>
        <h1 className='text-2xl font-bold text-foreground'>Foros de Discusión</h1>
        <p className='text-sm text-muted-foreground'>Participa en las discusiones de tus cursos</p>
      </header>
      <main className='p-4'>
        {loading ? (
          <div>Cargando foros...</div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Respuestas</TableHead>
                  <TableHead>Vistas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-center text-muted-foreground'>
                      No hay threads de discusión
                    </TableCell>
                  </TableRow>
                ) : (
                  threads.map((thread) => (
                    <TableRow key={thread.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {thread.isPinned && <Pin className='h-4 w-4 text-primary' />}
                          {thread.isClosed && <Lock className='h-4 w-4 text-muted-foreground' />}
                          <span className='font-medium'>{thread.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{thread.course.title}</TableCell>
                      <TableCell>{thread.user.profile.name}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <MessageSquare className='h-4 w-4' />
                          {thread._count.posts}
                        </div>
                      </TableCell>
                      <TableCell>{thread.views}</TableCell>
                      <TableCell>
                        <Badge variant={thread.isClosed ? 'secondary' : 'default'}>
                          {thread.isClosed ? 'Cerrado' : 'Abierto'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(thread.createdAt), 'dd/MM/yyyy', { locale: es })}</TableCell>
                      <TableCell>
                        <Button variant='ghost' size='sm' onClick={() => router.push(`/instructor/foros/${thread.id}`)}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  )
}
