'use client'

import { File, Trash2, Upload } from 'lucide-react'
import { useCallback, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { getSessionForUpload, updateLessonContent, uploadFile } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DocumentContentSchema, parseDocumentContent } from '@/lib/content-validators'
import type { ContentEditorProps } from './types'

const MAX_TITLE_LENGTH = 255

interface DocumentEditorState {
  title: string
  fileUrl: string
  fileName: string
  fileSize: number
}

export function DocumentEditor({ content, onUpdate }: ContentEditorProps) {
  // TODOS LOS HOOKS PRIMERO
  const contentId = content.id
  const initialData = parseDocumentContent(content.content)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAudio = content.tipo === 'AUDIO'
  const ALLOWED_TYPES = isAudio
    ? ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
    : [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

  const FILE_SIZE_LIMIT = 100 * 1024 * 1024 // 100MB

  const [state, setState] = useState<DocumentEditorState>({
    title: typeof content.title === 'string' ? content.title : '',
    fileUrl: initialData.url,
    fileName: initialData.name,
    fileSize: initialData.size
  })

  const [isPending, startTransition] = useTransition()

  // Validar título
  const handleTitleChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({ ...prev, title: value.substring(0, MAX_TITLE_LENGTH) }))
  }, [])

  // Validar y subir archivo
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validar tipo de archivo
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Tipo de archivo no permitido. Soportados: ${isAudio ? 'MP3, WAV, OGG, WebM' : 'PDF, DOC, DOCX, XLS, XLSX'}`)
        return
      }

      // Validar tamaño de archivo
      if (file.size > FILE_SIZE_LIMIT) {
        toast.error(`El archivo es demasiado grande (máx ${(FILE_SIZE_LIMIT / 1024 / 1024).toFixed(0)}MB)`)
        return
      }

      startTransition(async () => {
        try {
          const session = await getSessionForUpload()
          if (!session?.id) {
            toast.error('Debes estar autenticado para subir archivos')
            return
          }

          const response = await uploadFile(file, session.id)

          if (!response.success || !response.data?.url || typeof response.data.url !== 'string') {
            throw new Error('La URL del archivo no es válida')
          }

          setState((prev) => ({
            ...prev,
            fileUrl: response.data.url,
            fileName: file.name,
            fileSize: file.size
          }))

          toast.success('Archivo subido correctamente')
        } catch (_error) {
          const errorMessage = _error instanceof Error ? _error.message : 'Error al subir el archivo'
          console.error('Error uploading file:', _error)
          toast.error(errorMessage)
        }
      })
    },
    [isAudio, ALLOWED_TYPES]
  )

  // Eliminar archivo
  const handleRemoveFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fileUrl: '',
      fileName: '',
      fileSize: 0
    }))
  }, [])

  // Validar URL (soporta URLs absolutas y relativas)
  const isValidFileUrl = useCallback((url: string): boolean => {
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
  const handleSave = useCallback(async () => {
    if (!state.fileUrl || typeof state.fileUrl !== 'string') {
      toast.error('Debes subir un archivo')
      return
    }

    // Validar URL del archivo
    if (state.fileUrl && !isValidFileUrl(state.fileUrl)) {
      toast.error('La URL del archivo no es válida')
      return
    }

    // Validar nombre del archivo
    if (state.fileName && typeof state.fileName !== 'string') {
      toast.error('El nombre del archivo debe ser texto')
      return
    }

    // Validar tamaño del archivo
    if (state.fileSize && typeof state.fileSize !== 'number') {
      toast.error('El tamaño debe ser un número')
      return
    }

    if (state.fileSize > FILE_SIZE_LIMIT) {
      toast.error(`El archivo no puede exceder ${(FILE_SIZE_LIMIT / 1024 / 1024).toFixed(0)}MB`)
      return
    }

    // Validar título
    if (state.title && state.title.length > MAX_TITLE_LENGTH) {
      toast.error(`El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`)
      return
    }

    // Validar con Zod
    try {
      DocumentContentSchema.parse({
        url: state.fileUrl,
        name: state.fileName,
        size: state.fileSize
      })
    } catch (validationError) {
      const errorMsg = validationError instanceof Error ? validationError.message : 'Error de validación'
      toast.error(errorMsg)
      return
    }

    startTransition(async () => {
      const content_str = JSON.stringify({
        url: state.fileUrl,
        name: state.fileName,
        size: state.fileSize
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
          loading: 'Guardando archivo...',
          success: 'Archivo guardado correctamente',
          error: (err) => (err instanceof Error ? err.message : 'Error al guardar')
        }
      )
    })
  }, [state, contentId, onUpdate, content, isValidFileUrl])

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
        <Label htmlFor='doc-title'>Título (opcional)</Label>
        <div className='relative'>
          <Input
            id='doc-title'
            type='text'
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder='Ej: Apuntes de clase'
            disabled={isPending}
          />
          <span className='absolute right-3 top-2.5 text-xs text-muted-foreground'>
            {state.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* Archivo */}
      <div>
        <Label>{isAudio ? 'Archivo de audio' : 'Documento'}</Label>

        {state.fileUrl ? (
          <div className='flex items-center gap-3 p-3 border border-input rounded-lg bg-muted/50'>
            <File className='w-6 h-6 text-primary shrink-0' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold truncate'>{state.fileName}</p>
              <p className='text-xs text-muted-foreground'>
                {state.fileSize ? `${(state.fileSize / 1024).toFixed(2)} KB` : 'Tamaño desconocido'}
              </p>
            </div>
            <Button
              type='button'
              onClick={handleRemoveFile}
              disabled={isPending}
              size='sm'
              variant='ghost'
              className='hover:bg-destructive/10 hover:text-destructive'
              title='Eliminar archivo'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className='border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary transition'
          >
            <Upload className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
            <p className='text-sm font-semibold'>Haz clic para subir un archivo</p>
            <p className='text-xs text-muted-foreground mt-1'>o arrastra y suelta aquí</p>
            <p className='text-xs text-muted-foreground mt-2'>Máximo {(FILE_SIZE_LIMIT / 1024 / 1024).toFixed(0)}MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type='file'
          accept={isAudio ? 'audio/*' : '.pdf,.doc,.docx,.xls,.xlsx'}
          onChange={handleFileSelect}
          disabled={isPending}
          className='hidden'
        />
      </div>

      {/* Botón guardar */}
      <Button onClick={handleSave} disabled={isPending} className='w-full' size='lg'>
        {isPending ? (
          <span className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
            Guardando...
          </span>
        ) : (
          'Guardar archivo'
        )}
      </Button>
    </div>
  )
}
