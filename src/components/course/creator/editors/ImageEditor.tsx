'use client'

import { ImageIcon, UploadIcon, X } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'
import { useCallback, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getSessionForUpload, updateLessonContent, uploadFile } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageContentSchema, parseImageContent } from '@/lib/content-validators'
import { ImageGallery } from './ImageGallery'
import type { ContentEditorProps } from './types'

const MAX_TITLE_LENGTH = 255
const MAX_ALT_LENGTH = 255
const MAX_FILE_SIZE = 1000 * 1024 * 1024 // 1gb
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']

interface ImageEditorState {
  title: string
  imageUrl: string
  altText: string
}

export function ImageEditor({ content, onUpdate }: ContentEditorProps) {
  // TODOS LOS HOOKS PRIMERO
  const contentId = content.id
  const initialData = parseImageContent(content.content)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<ImageEditorState>({
    title: typeof content.title === 'string' ? content.title : '',
    imageUrl: initialData.url,
    altText: initialData.alt
  })

  const [isPending, startTransition] = useTransition()
  const [showGallery, setShowGallery] = useState(false)
  const [userSession, setUserSession] = useState<{ id: string } | null>(null)

  // Cargar sesión del usuario
  const loadSession = useCallback(async () => {
    try {
      const session = await getSessionForUpload()
      setUserSession({ id: session.id })
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }, [])

  React.useEffect(() => {
    loadSession()
  }, [loadSession])

  // Validar título
  const handleTitleChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({ ...prev, title: value.substring(0, MAX_TITLE_LENGTH) }))
  }, [])

  // Validar texto alternativo
  const handleAltChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({ ...prev, altText: value.substring(0, MAX_ALT_LENGTH) }))
  }, [])

  // Validar y subir archivo de imagen
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Tipo de imagen no permitido')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`La imagen es demasiado grande (máx ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB)`)
        return
      }

      startTransition(async () => {
        toast.promise(
          uploadFile(file, userSession?.id || '').then((response) => {
            if (!response.success || !response.data?.url || typeof response.data.url !== 'string') {
              throw new Error(response.error || 'La URL de la imagen no es válida')
            }
            setState((prev) => ({ ...prev, imageUrl: response.data.url }))
            return response
          }),
          {
            loading: 'Subiendo imagen...',
            success: 'Imagen subida correctamente',
            error: (err) => (err instanceof Error ? err.message : 'Error al subir la imagen')
          }
        )
      })
    },
    [userSession?.id]
  )

  // Eliminar imagen
  const handleRemoveImage = useCallback(() => {
    setState((prev) => ({ ...prev, imageUrl: '' }))
  }, [])

  // Seleccionar imagen de galería
  const handleSelectFromGallery = useCallback((url: string) => {
    setState((prev) => ({ ...prev, imageUrl: url }))
    toast.success('Imagen seleccionada')
  }, [])

  // Validar URL (soporta URLs absolutas y relativas)
  const isValidImageUrl = useCallback((url: string): boolean => {
    if (!url || typeof url !== 'string') return false

    // Aceptar URLs relativas que empiezan con /
    if (url.startsWith('/')) return true

    // Aceptar URLs absolutas con protocolo
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }, [])

  // Guardar con validación exhaustiva
  const handleSave = useCallback(() => {
    if (!state.imageUrl || typeof state.imageUrl !== 'string') {
      toast.error('Debes subir una imagen')
      return
    }

    if (!isValidImageUrl(state.imageUrl)) {
      toast.error('La URL de la imagen no es válida')
      return
    }

    try {
      ImageContentSchema.parse({
        url: state.imageUrl,
        alt: state.altText || undefined
      })
    } catch (validationError) {
      const errorMsg = validationError instanceof Error ? validationError.message : 'Error de validación'
      toast.error(errorMsg)
      return
    }

    startTransition(async () => {
      const content_str = JSON.stringify({
        url: state.imageUrl,
        alt: state.altText || ''
      })

      const formData = new FormData()
      formData.append('contentId', contentId)
      formData.append('title', state.title || '')
      formData.append('content', content_str)

      toast.promise(
        updateLessonContent(formData).then((response) => {
          if (response.success && response.data) {
            onUpdate(contentId, {
              ...content,
              title: state.title,
              content: content_str
            })
          }
        }),
        {
          loading: 'Guardando imagen...',
          success: 'Imagen guardada correctamente',
          error: (err) => (err instanceof Error ? err.message : 'Error al guardar')
        }
      )
    })
  }, [state, contentId, onUpdate, content, isValidImageUrl])

  // Validar ID de contenido DESPUÉS de todos los hooks
  if (!contentId || typeof contentId !== 'string') {
    return (
      <div className='flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-md'>
        <span className='text-sm text-destructive'>Error: ID de contenido no válido</span>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Título */}
      <div>
        <Label htmlFor='image-title'>Título (opcional)</Label>
        <div className='relative'>
          <Input
            id='image-title'
            type='text'
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder='Ej: Diagrama de arquitectura'
            disabled={isPending}
          />
          <span className='absolute right-3 top-2.5 text-xs text-muted-foreground'>
            {state.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* Imagen */}
      <div>
        <Label>Imagen</Label>
        {state.imageUrl ? (
          <div className='relative w-full'>
            <Image
              src={state.imageUrl}
              alt={state.altText || 'Imagen cargada'}
              className='w-full h-64 object-cover rounded-lg border border-input'
              width={200}
              height={200}
            />
            <Button
              type='button'
              onClick={handleRemoveImage}
              disabled={isPending}
              size='icon'
              variant='destructive'
              className='absolute top-2 right-2 h-8 w-8'
              title='Eliminar imagen'
            >
              <X className='w-4 h-4' />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className='border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary transition'
          >
            <UploadIcon className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
            <p className='text-sm font-semibold'>Haz clic para subir una imagen</p>
            <p className='text-xs text-muted-foreground mt-1'>o arrastra y suelta aquí</p>
            <p className='text-xs text-muted-foreground mt-2'>Máximo {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileSelect}
          disabled={isPending}
          className='hidden'
        />

        {/* Galería button */}
        {userSession && (
          <Button
            type='button'
            onClick={() => setShowGallery(true)}
            disabled={isPending}
            variant='secondary'
            className='mt-3 w-full'
          >
            <ImageIcon className='w-4 h-4 mr-2' />
            Ver galería de imágenes
          </Button>
        )}
      </div>

      {/* Texto alternativo */}
      <div>
        <Label htmlFor='image-alt'>Texto alternativo (opcional)</Label>
        <div className='relative'>
          <Input
            id='image-alt'
            type='text'
            value={state.altText}
            onChange={(e) => handleAltChange(e.target.value)}
            maxLength={MAX_ALT_LENGTH}
            placeholder='Descripción de la imagen para accesibilidad'
            disabled={isPending}
          />
          <span className='absolute right-3 top-2.5 text-xs text-muted-foreground'>
            {state.altText.length}/{MAX_ALT_LENGTH}
          </span>
        </div>
      </div>

      {/* Botón guardar */}
      <Button onClick={handleSave} disabled={isPending} className='w-full' size='lg'>
        {isPending ? (
          <span className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
            Guardando...
          </span>
        ) : (
          'Guardar imagen'
        )}
      </Button>

      {/* Galería Modal */}
      {userSession && (
        <ImageGallery
          open={showGallery}
          userId={userSession.id}
          onSelectImage={handleSelectFromGallery}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  )
}
