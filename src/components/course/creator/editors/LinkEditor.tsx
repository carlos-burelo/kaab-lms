'use client'

import { ExternalLink } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { updateLessonContent } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LinkContentSchema, parseLinkContent } from '@/lib/content-validators'
import type { ContentEditorProps } from './types'

const MAX_TITLE_LENGTH = 255
const MAX_URL_LENGTH = 2048
const MAX_DESCRIPTION_LENGTH = 1000

interface LinkEditorState {
  title: string
  url: string
  description: string
}

export function LinkEditor({ content, onUpdate }: ContentEditorProps) {
  // TODOS LOS HOOKS PRIMERO
  const contentId = content.id
  const initialData = parseLinkContent(content.content)

  const [state, setState] = useState<LinkEditorState>({
    title: typeof content.title === 'string' ? content.title : '',
    url: initialData.url,
    description: initialData.description
  })

  const [isPending, startTransition] = useTransition()

  // Validar título
  const handleTitleChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({ ...prev, title: value.substring(0, MAX_TITLE_LENGTH) }))
  }, [])

  // Validar URL
  const handleUrlChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({ ...prev, url: value.substring(0, MAX_URL_LENGTH) }))
  }, [])

  // Validar descripción
  const handleDescriptionChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({ ...prev, description: value.substring(0, MAX_DESCRIPTION_LENGTH) }))
  }, [])

  // Guardar con validación exhaustiva
  const handleSave = useCallback(async () => {
    if (!state.url || !state.url.trim()) {
      toast.error('Debes ingresar una URL')
      return
    }

    if (state.url.length > MAX_URL_LENGTH) {
      toast.error(`La URL no puede exceder ${MAX_URL_LENGTH} caracteres`)
      return
    }

    try {
      new URL(state.url)
    } catch {
      toast.error('La URL no es válida')
      return
    }

    try {
      LinkContentSchema.parse({
        url: state.url,
        description: state.description || undefined
      })
    } catch (validationError) {
      const errorMsg = validationError instanceof Error ? validationError.message : 'Error de validación'
      toast.error(errorMsg)
      return
    }

    startTransition(async () => {
      const content_str = JSON.stringify({
        url: state.url,
        description: state.description || ''
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
          loading: 'Guardando enlace...',
          success: 'Enlace guardado correctamente',
          error: (err) => (err instanceof Error ? err.message : 'Error al guardar')
        }
      )
    })
  }, [state, contentId, onUpdate, content])

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
        <Label htmlFor='link-title'>Título (opcional)</Label>
        <div className='relative'>
          <Input
            id='link-title'
            type='text'
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder='Ej: Documentación oficial'
            disabled={isPending}
          />
          <span className='absolute right-3 top-2.5 text-xs text-muted-foreground'>
            {state.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* URL */}
      <div>
        <Label htmlFor='link-url'>URL del enlace</Label>
        <div className='flex gap-2'>
          <div className='flex-1 relative'>
            <Input
              id='link-url'
              type='url'
              value={state.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              maxLength={MAX_URL_LENGTH}
              placeholder='https://ejemplo.com'
              disabled={isPending}
            />
            <span className='absolute right-3 top-2.5 text-xs text-muted-foreground'>
              {state.url.length}/{MAX_URL_LENGTH}
            </span>
          </div>
          {state.url && (
            <Button asChild variant='outline' size='icon' title='Abrir enlace en nueva pestaña'>
              <a href={state.url} target='_blank' rel='noopener noreferrer'>
                <ExternalLink className='w-4 h-4' />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <Label htmlFor='link-description'>Descripción (opcional)</Label>
        <div className='relative'>
          <Textarea
            id='link-description'
            value={state.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder='Describe brevemente a qué se refiere este enlace...'
            rows={3}
            disabled={isPending}
          />
          <span className='absolute right-3 bottom-2 text-xs text-muted-foreground'>
            {state.description.length}/{MAX_DESCRIPTION_LENGTH}
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
          'Guardar enlace'
        )}
      </Button>
    </div>
  )
}
