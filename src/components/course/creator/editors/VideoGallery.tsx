'use client'

import { Loader, Play } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { getUploadedFiles } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface GalleryVideo {
  id: string
  nombre: string
  url: string
  tipo: string
  creadoEn: Date
}

interface VideoGalleryProps {
  userId: string
  open: boolean
  onSelectVideo: (url: string) => void
  onClose: () => void
}

export function VideoGallery({ userId, open, onSelectVideo, onClose }: VideoGalleryProps) {
  const [videos, setVideos] = useState<GalleryVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const loadVideos = async () => {
      try {
        setIsLoading(true)
        const files = await getUploadedFiles(userId, 'video')
        setVideos(
          files.map((f) => ({
            id: f.id,
            nombre: f.name,
            url: f.url,
            tipo: f.type,
            creadoEn: new Date(f.createdAt)
          }))
        )
        setError(null)
      } catch (err) {
        setError('Error al cargar los videos')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadVideos()
  }, [userId, open])

  const handleSelectVideo = useCallback(
    (video: GalleryVideo) => {
      onSelectVideo(video.url)
      onClose()
    },
    [onSelectVideo, onClose]
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Galería de videos</DialogTitle>
          <DialogDescription>Selecciona un video para usar en tu contenido</DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className='flex-1 overflow-auto p-4'>
          {isLoading ? (
            <div className='flex items-center justify-center h-48'>
              <div className='flex flex-col items-center gap-2'>
                <Loader className='w-8 h-8 animate-spin text-primary' />
                <p className='text-muted-foreground'>Cargando videos...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
              <span className='text-sm text-destructive'>{error}</span>
            </div>
          ) : videos.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground mb-2'>No hay videos aún</p>
              <p className='text-sm text-muted-foreground/70'>Sube un video primero para verlo aquí</p>
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
              {videos.map((video) => (
                <Button
                  key={video.id}
                  onClick={() => handleSelectVideo(video)}
                  className='group relative aspect-video rounded-lg overflow-hidden border-2 border-input hover:border-primary transition'
                  title={video.nombre}
                >
                  <div className='w-full h-full bg-secondary flex items-center justify-center'>
                    <Play className='w-12 h-12 text-primary opacity-50 group-hover:opacity-100 transition' />
                  </div>
                  <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center'>
                    <span className='text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition'>
                      Seleccionar
                    </span>
                  </div>
                  <p className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate'>
                    {video.nombre}
                  </p>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
