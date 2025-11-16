'use client'

import { Play, UploadIcon, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getSessionForUpload, updateLessonContent, uploadFile } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { parseVideoContent, VideoContentSchema } from '@/lib/content-validators'
import type { ContentEditorProps } from './types'
import { VideoGallery } from './VideoGallery'

const MAX_TITLE_LENGTH = 255
const MAX_URL_LENGTH = 2048
const MAX_EMBED_LENGTH = 10000
const MAX_FILE_SIZE = 500 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
type VideoType = 'url' | 'embed' | 'upload'
interface VideoEditorState {
  title: string
  videoType: VideoType
  videoUrl: string
  embedCode: string
  uploadedFileName: string
}
export function VideoEditor({ content, onUpdate }: ContentEditorProps) {
  const contentId = content.id
  const initialData = parseVideoContent(content.content)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<VideoEditorState>({
    title: typeof content.title === 'string' ? content.title : '',
    videoType: initialData.type,
    videoUrl: initialData.url,
    embedCode: initialData.embed,
    uploadedFileName: ''
  })
  const [isPending, startTransition] = useTransition()
  const [showGallery, setShowGallery] = useState(false)
  const [userSession, setUserSession] = useState<{
    id: string
  } | null>(null)
  const loadSession = useCallback(async () => {
    try {
      const session = await getSessionForUpload()
      setUserSession({
        id: session.id
      })
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }, [])
  useEffect(() => {
    loadSession()
  }, [loadSession])
  const handleTitleChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({
      ...prev,
      title: value.substring(0, MAX_TITLE_LENGTH)
    }))
  }, [])
  const handleUrlChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({
      ...prev,
      videoUrl: value.substring(0, MAX_URL_LENGTH)
    }))
  }, [])
  const handleEmbedChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({
      ...prev,
      embedCode: value.substring(0, MAX_EMBED_LENGTH)
    }))
  }, [])
  const handleTypeChange = useCallback((type: VideoType) => {
    setState((prev) => ({
      ...prev,
      videoType: type
    }))
  }, [])
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        toast.error('Tipo de video no permitido')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`El video es demasiado grande (máx ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB)`)
        return
      }
      startTransition(async () => {
        toast.promise(
          uploadFile(file, userSession?.id || '').then((response) => {
            if (!response.success || !response.data?.url || typeof response.data.url !== 'string') {
              throw new Error(response.error || 'La URL del video no es válida')
            }
            setState((prev) => ({
              ...prev,
              videoUrl: response.data.url,
              uploadedFileName: file.name,
              videoType: 'upload'
            }))
            return response
          }),
          {
            loading: 'Subiendo video...',
            success: 'Video subido correctamente',
            error: (err) => (err instanceof Error ? err.message : 'Error al subir el video')
          }
        )
      })
    },
    [userSession?.id]
  )
  const handleRemoveVideo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      videoUrl: '',
      uploadedFileName: '',
      videoType: 'url'
    }))
  }, [])
  const handleSelectFromGallery = useCallback((url: string) => {
    setState((prev) => ({
      ...prev,
      videoUrl: url,
      videoType: 'upload'
    }))
    toast.success('Video seleccionado')
  }, [])
  const isValidVideoUrl = useCallback((url: string): boolean => {
    if (!url || typeof url !== 'string') return false

    // URLs relativas
    if (url.startsWith('/')) return true

    // URLs relativas desde uploads
    if (url.includes('/uploads/')) return true

    // URLs de plataformas comunes
    const commonPatterns = [
      /^https?:\/\/(www\.)?youtube\.com/i,
      /^https?:\/\/(www\.)?youtu\.be/i,
      /^https?:\/\/(www\.)?vimeo\.com/i,
      /^https?:\/\/.*\.mp4$/i,
      /^https?:\/\/.*\.webm$/i,
      /^https?:\/\/.*\.ogv$/i
    ]

    if (commonPatterns.some((pattern) => pattern.test(url))) {
      return true
    }

    // Intentar como URL absoluta
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }, [])
  const handleSave = useCallback(() => {
    if (!state.videoUrl && !state.embedCode) {
      toast.error('Debes cargar o ingresar un video')
      return
    }
    if (state.videoType === 'url' || state.videoType === 'upload') {
      if (!state.videoUrl) {
        toast.error('Debes cargar o ingresar una URL de video')
        return
      }
      if (!isValidVideoUrl(state.videoUrl)) {
        toast.error('La URL del video no es válida')
        return
      }
    }
    if (state.videoType === 'embed' && !state.embedCode) {
      toast.error('Debes ingresar el código embed')
      return
    }
    try {
      VideoContentSchema.parse({
        url: state.videoUrl,
        embed: state.embedCode,
        type: state.videoType === 'upload' ? 'url' : state.videoType
      })
    } catch (validationError) {
      const errorMsg = validationError instanceof Error ? validationError.message : 'Error de validación'
      toast.error(errorMsg)
      return
    }
    startTransition(async () => {
      const content_str = JSON.stringify({
        url: state.videoUrl,
        embed: state.embedCode,
        type: state.videoType === 'upload' ? 'url' : state.videoType
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
          loading: 'Guardando video...',
          success: 'Video guardado correctamente',
          error: (err) => (err instanceof Error ? err.message : 'Error al guardar')
        }
      )
    })
  }, [state, contentId, onUpdate, content, isValidVideoUrl])
  if (!contentId || typeof contentId !== 'string') {
    return (
      <div className='flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-md'>
        <span className='text-sm text-destructive'>Error: ID de contenido no válido</span>
      </div>
    )
  }
  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='video-title'>Título (opcional)</Label>
        <div className='relative'>
          <Input
            id='video-title'
            type='text'
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder='Ej: Introducción a React'
            disabled={isPending}
          />
          <span className='absolute right-3 top-2.5 text-xs text-muted-foreground'>
            {state.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      <div>
        <Label>Tipo de Video</Label>
        <div className='flex gap-4 flex-wrap mt-2'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='video-type'
              value='url'
              checked={state.videoType === 'url'}
              onChange={(e) => handleTypeChange(e.target.value as VideoType)}
              disabled={isPending}
              className='w-4 h-4'
            />
            <span className='text-sm'>URL de video</span>
          </label>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='video-type'
              value='upload'
              checked={state.videoType === 'upload'}
              onChange={(e) => handleTypeChange(e.target.value as VideoType)}
              disabled={isPending}
              className='w-4 h-4'
            />
            <span className='text-sm'>Cargar video</span>
          </label>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='video-type'
              value='embed'
              checked={state.videoType === 'embed'}
              onChange={(e) => handleTypeChange(e.target.value as VideoType)}
              disabled={isPending}
              className='w-4 h-4'
            />
            <span className='text-sm'>Código embebido</span>
          </label>
        </div>
      </div>

      {state.videoType === 'url' && (
        <div>
          <Label htmlFor='video-url'>URL del video</Label>
          <Input
            id='video-url'
            type='url'
            value={state.videoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            maxLength={MAX_URL_LENGTH}
            placeholder='https://youtube.com/watch?v=...'
            disabled={isPending}
          />
          <p className='text-xs text-muted-foreground mt-1'>Soporta YouTube, Vimeo y otras plataformas</p>
          <p className='text-xs text-muted-foreground mt-1'>
            {state.videoUrl.length}/{MAX_URL_LENGTH} caracteres
          </p>
        </div>
      )}

      {state.videoType === 'upload' && (
        <div>
          <Label>Video</Label>
          {state.videoUrl ? (
            <div className='relative w-full p-4 border border-input rounded-lg bg-secondary/10'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Play className='w-4 h-4 text-primary' />
                  <span className='text-sm font-medium'>{state.uploadedFileName || 'Video cargado'}</span>
                </div>
                <Button
                  type='button'
                  onClick={handleRemoveVideo}
                  disabled={isPending}
                  size='sm'
                  variant='ghost'
                  className='hover:bg-destructive/10 hover:text-destructive'
                  title='Eliminar video'
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>
            </div>
          ) : (
            <div
              role='presentation'
              onClick={() => fileInputRef.current?.click()}
              className='border border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary transition'
            >
              <UploadIcon className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
              <p className='text-sm font-semibold'>Haz clic para subir un video</p>
              <p className='text-xs text-muted-foreground mt-1'>o arrastra y suelta aquí</p>
              <p className='text-xs text-muted-foreground mt-2'>Máximo {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type='file'
            accept='video/*'
            onChange={handleFileSelect}
            disabled={isPending}
            className='hidden'
          />

          {}
          {userSession && (
            <Button
              type='button'
              onClick={() => setShowGallery(true)}
              disabled={isPending}
              variant='secondary'
              className='mt-3 w-full'
            >
              <Play className='w-4 h-4 mr-2' />
              Ver galería de videos
            </Button>
          )}
        </div>
      )}

      {}
      {state.videoType === 'embed' && (
        <div>
          <Label htmlFor='video-embed'>Código embed HTML</Label>
          <Textarea
            id='video-embed'
            value={state.embedCode}
            onChange={(e) => handleEmbedChange(e.target.value)}
            maxLength={MAX_EMBED_LENGTH}
            placeholder='<iframe src="..." ></iframe>'
            rows={5}
            disabled={isPending}
            className='font-mono'
          />
          <p className='text-xs text-muted-foreground mt-1'>Pega el código embed HTML del video</p>
          <p className='text-xs text-muted-foreground mt-1'>
            {state.embedCode.length}/{MAX_EMBED_LENGTH} caracteres
          </p>
        </div>
      )}

      {}
      <Button onClick={handleSave} disabled={isPending} className='w-full' size='lg'>
        {isPending ? (
          <span className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
            Guardando...
          </span>
        ) : (
          'Guardar video'
        )}
      </Button>

      {}
      {userSession && (
        <VideoGallery
          open={showGallery}
          userId={userSession.id}
          onSelectVideo={handleSelectFromGallery}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  )
}
