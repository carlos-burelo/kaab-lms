'use client'

import { Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getSessionForUpload, uploadFile } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ImageUploaderProps {
  label: string
  onImageUpload: (fileId: string) => void
  currentImage?: string
  required?: boolean
}

const MAX_FILE_SIZE = 1000 * 1024 * 1024 // 1gb
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function ImageUploader({ label, onImageUpload, currentImage, required = false }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string>(currentImage || '')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPG, PNG, WebP, GIF)')
      return
    }

    // Validar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`La imagen es demasiado grande (máx ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB)`)
      return
    }

    // Crear preview local
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        setPreview(result)
      }
    }
    reader.readAsDataURL(file)

    // Subir archivo
    startTransition(async () => {
      toast.promise(
        (async () => {
          try {
            const session = await getSessionForUpload()
            if (!session?.id) {
              throw new Error('Debes estar autenticado para subir imágenes')
            }

            const response = await uploadFile(file, session.id)

            if (!response.success || !response.data?.id || typeof response.data.id !== 'string') {
              throw new Error(response.error || 'No se pudo obtener el ID de la imagen')
            }

            if (!response.data?.url || typeof response.data.url !== 'string') {
              throw new Error('La URL de la imagen no es válida')
            }

            setPreview(response.data.url)
            onImageUpload(response.data.id)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen'
            console.error('Error uploading image:', error)
            throw new Error(errorMessage)
          }
        })(),
        {
          loading: 'Subiendo imagen...',
          success: 'Imagen subida correctamente',
          error: (err) => (err instanceof Error ? err.message : 'Error al subir')
        }
      )
    })
  }

  const handleRemoveImage = () => {
    setPreview('')
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <Label>
        {label}
        {required && <span className='text-destructive ml-1'>*</span>}
      </Label>

      {preview ? (
        <div className='mt-2 relative'>
          <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-muted border border-input'>
            <Image src={preview} alt='Vista previa del curso' fill className='object-cover' />
          </div>
          <Button
            type='button'
            onClick={handleRemoveImage}
            disabled={isPending}
            size='sm'
            variant='destructive'
            className='mt-2 w-full'
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Eliminar imagen
          </Button>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          className='mt-2 border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition'
        >
          <Upload className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
          <p className='text-sm font-semibold'>Haz clic para subir una imagen</p>
          <p className='text-xs text-muted-foreground mt-1'>o arrastra y suelta aquí</p>
          <p className='text-xs text-muted-foreground mt-2'>
            JPG, PNG, WebP, GIF • Máximo {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB
          </p>
        </button>
      )}

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        disabled={isPending}
        className='hidden'
      />
    </div>
  )
}
