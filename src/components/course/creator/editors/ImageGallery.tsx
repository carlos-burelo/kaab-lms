'use client'

import { Loader } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { getUploadedFiles } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface GalleryImage {
  id: string
  nombre: string
  url: string
  tipo: string
  creadoEn: Date
}

interface ImageGalleryProps {
  userId: string
  open: boolean
  onSelectImage: (url: string) => void
  onClose: () => void
}

export function ImageGallery({ userId, open, onSelectImage, onClose }: ImageGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const loadImages = async () => {
      try {
        setIsLoading(true)
        const files = await getUploadedFiles(userId, 'image')
        setImages(
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
        setError('Error al cargar las imágenes')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [userId, open])

  const handleSelectImage = useCallback(
    (image: GalleryImage) => {
      onSelectImage(image.url)
      onClose()
    },
    [onSelectImage, onClose]
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Galería de imágenes</DialogTitle>
          <DialogDescription>Selecciona una imagen para usar en tu contenido</DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className='flex-1 overflow-auto p-4'>
          {isLoading ? (
            <div className='flex items-center justify-center h-48'>
              <div className='flex flex-col items-center gap-2'>
                <Loader className='w-8 h-8 animate-spin text-primary' />
                <p className='text-muted-foreground'>Cargando imágenes...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
              <span className='text-sm text-destructive'>{error}</span>
            </div>
          ) : images.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground mb-2'>No hay imágenes aún</p>
              <p className='text-sm text-muted-foreground/70'>Sube una imagen primero para verla aquí</p>
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
              {images.map((image) => (
                <Button
                  key={image.id}
                  onClick={() => handleSelectImage(image)}
                  className='group relative aspect-square rounded-lg overflow-hidden border-2 border-input hover:border-primary transition'
                  title={image.nombre}
                >
                  <Image
                    src={image.url}
                    alt={image.nombre}
                    width={300}
                    height={300}
                    className='w-full h-full object-cover group-hover:opacity-75 transition'
                    onError={(e) => {
                      const el = e.target as HTMLImageElement
                      el.src = '/fallback-course.webp'
                    }}
                  />
                  <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center'>
                    <span className='text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition'>
                      Seleccionar
                    </span>
                  </div>
                  <p className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate'>
                    {image.nombre}
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
