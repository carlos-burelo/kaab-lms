'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { getAnnouncements, deleteAnnouncement } from '@/actions/instructor/announcement.actions'
import { toast } from 'sonner'

type Announcement = {
  id: string
  title: string
  content: string
  placement: string
  startDate: Date
  endDate: Date
  isActive: boolean
  viewCount: number
  clickCount: number
  targetCourse: { title: string } | null
}

export function AnnouncementsDataTable() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const loadAnnouncements = useCallback(async () => {
    setLoading(true)
    const result = await getAnnouncements({})

    if (result.success && result.data) {
      setAnnouncements(result.data as any)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este anuncio?')) return

    startTransition(async () => {
      const result = await deleteAnnouncement({ announcementId: id })

      if (result.success) {
        toast.success('Anuncio eliminado correctamente')
        loadAnnouncements()
      } else {
        toast.error('Error al eliminar el anuncio')
      }
    })
  }

  if (loading) {
    return <div className='p-4'>Cargando anuncios...</div>
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Colocación</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Fin</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Vistas</TableHead>
            <TableHead className='text-right'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className='text-center text-muted-foreground'>
                No hay anuncios creados
              </TableCell>
            </TableRow>
          ) : (
            announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell className='font-medium'>{announcement.title}</TableCell>
                <TableCell>
                  <Badge variant='outline'>{announcement.placement}</Badge>
                </TableCell>
                <TableCell>
                  {announcement.targetCourse?.title || 'Global'}
                </TableCell>
                <TableCell>
                  {format(new Date(announcement.startDate), 'dd/MM/yyyy', {
                    locale: es
                  })}
                </TableCell>
                <TableCell>
                  {format(new Date(announcement.endDate), 'dd/MM/yyyy', {
                    locale: es
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                    {announcement.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Eye className='h-4 w-4 text-muted-foreground' />
                    <span>{announcement.viewCount}</span>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/instructor/anuncios/${announcement.id}`)
                        }
                      >
                        <Pencil className='mr-2 h-4 w-4' />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(announcement.id)}
                        disabled={isPending}
                        className='text-destructive'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
