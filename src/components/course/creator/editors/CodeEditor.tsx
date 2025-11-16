'use client'

import { Copy } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { updateLessonContent } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CodeContentSchema, parseCodeContent } from '@/lib/content-validators'
import type { ContentEditorProps } from './types'

const MAX_TITLE_LENGTH = 255
const MAX_CODE_LENGTH = 50000
const VALID_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'sql',
  'html',
  'css',
  'bash',
  'json',
  'xml'
] as const

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' }
]

type Language = (typeof VALID_LANGUAGES)[number]

interface CodeEditorState {
  title: string
  code: string
  language: Language
}

export function CodeEditor({ content, onUpdate }: ContentEditorProps) {
  // TODOS LOS HOOKS PRIMERO
  const contentId = content.id
  const initialData = parseCodeContent(content.content)

  const [state, setState] = useState<CodeEditorState>({
    title: typeof content.title === 'string' ? content.title : '',
    code: initialData.code,
    language: initialData.language
  })

  const [isPending, startTransition] = useTransition()

  // Validar título
  const handleTitleChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({ ...prev, title: value.substring(0, MAX_TITLE_LENGTH) }))
  }, [])

  // Validar código
  const handleCodeChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({ ...prev, code: value.substring(0, MAX_CODE_LENGTH) }))
  }, [])

  // Validar lenguaje
  const handleLanguageChange = useCallback((value: string) => {
    if (VALID_LANGUAGES.includes(value as Language)) {
      setState((prev) => ({ ...prev, language: value as Language }))
    }
  }, [])

  // Copiar código al portapapeles
  const handleCopyCode = useCallback(() => {
    if (!state.code) {
      toast.error('No hay código para copiar')
      return
    }

    navigator.clipboard
      .writeText(state.code)
      .then(() => {
        toast.success('Código copiado al portapapeles')
      })
      .catch(() => {
        toast.error('Error al copiar el código')
      })
  }, [state.code])

  // Guardar con validación exhaustiva
  const handleSave = useCallback(async () => {
    if (!state.code || !state.code.trim()) {
      toast.error('Debes ingresar código')
      return
    }

    if (state.code.length > MAX_CODE_LENGTH) {
      toast.error(`El código no puede exceder ${MAX_CODE_LENGTH} caracteres`)
      return
    }

    try {
      CodeContentSchema.parse({
        code: state.code,
        language: state.language
      })
    } catch (validationError) {
      const errorMsg = validationError instanceof Error ? validationError.message : 'Error de validación'
      toast.error(errorMsg)
      return
    }

    startTransition(async () => {
      toast.promise(
        (async () => {
          const content_str = JSON.stringify({
            code: state.code,
            language: state.language
          })

          const formData = new FormData()
          formData.append('contentId', contentId)
          formData.append('title', state.title || '')
          formData.append('content', content_str)

          const response = await updateLessonContent(formData)
          if (response.success && response.data) {
            onUpdate(contentId, {
              ...content,
              title: state.title,
              content: content_str
            })
          }
        })(),
        {
          loading: 'Guardando código...',
          success: 'Código guardado correctamente',
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
        <Label htmlFor='code-title'>Título (opcional)</Label>
        <div className='relative'>
          <Input
            id='code-title'
            type='text'
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder='Ej: Función para calcular factorial'
            disabled={isPending}
          />
          <span className='absolute right-3 top-2.5 text-xs text-muted-foreground'>
            {state.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* Lenguaje */}
      <div>
        <Label htmlFor='code-language'>Lenguaje de programación</Label>
        <Select value={state.language} onValueChange={handleLanguageChange} disabled={isPending}>
          <SelectTrigger id='code-language'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Código */}
      <div>
        <Label htmlFor='code-content'>Código</Label>
        <div className='relative'>
          <Textarea
            id='code-content'
            value={state.code}
            onChange={(e) => handleCodeChange(e.target.value)}
            maxLength={MAX_CODE_LENGTH}
            placeholder='Pega tu código aquí...'
            rows={12}
            disabled={isPending}
            className='font-mono'
            spellCheck='false'
          />
          <span className='absolute right-3 bottom-2 text-xs text-muted-foreground'>
            {state.code.length}/{MAX_CODE_LENGTH}
          </span>
        </div>
      </div>

      {/* Vista previa */}
      {state.code && (
        <div className='bg-muted/50 p-3 rounded border border-input'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-xs text-muted-foreground font-semibold'>Vista previa:</p>
            <Button
              type='button'
              onClick={handleCopyCode}
              disabled={isPending}
              variant='ghost'
              size='sm'
              className='h-auto p-1'
              title='Copiar código'
            >
              <Copy className='w-3 h-3 mr-1' />
              <span className='text-xs'>Copiar</span>
            </Button>
          </div>
          <pre className='bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-auto max-h-32'>
            <code>{state.code}</code>
          </pre>
        </div>
      )}

      {/* Botón guardar */}
      <Button onClick={handleSave} disabled={isPending} className='w-full' size='lg'>
        {isPending ? (
          <span className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
            Guardando...
          </span>
        ) : (
          'Guardar código'
        )}
      </Button>
    </div>
  )
}
