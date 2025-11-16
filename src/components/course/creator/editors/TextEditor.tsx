'use client'

import { CharacterCount } from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Palette,
  Paperclip,
  Quote,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
  Video as VideoIcon,
  Youtube as YoutubeIcon
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateLessonContent } from '@/actions/courseActions'
import { uploadFile, uploadImage, uploadVideo } from '@/actions/upload-actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { parseTextContent, TextContentSchema } from '@/lib/content-validators'
import { Video } from '@/lib/extensions/video-extension'
import type { ContentEditorProps } from './types'

const MAX_TITLE_LENGTH = 255
const MAX_CONTENT_LENGTH = 100000

const COLORS = [
  { name: 'Negro', value: '#000000' },
  { name: 'Gris oscuro', value: '#374151' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Gris claro', value: '#9CA3AF' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Ámbar', value: '#F59E0B' },
  { name: 'Amarillo', value: '#EAB308' },
  { name: 'Lima', value: '#84CC16' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Esmeralda', value: '#059669' },
  { name: 'Cian', value: '#06B6D4' },
  { name: 'Azul cielo', value: '#0EA5E9' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Violeta', value: '#8B5CF6' },
  { name: 'Púrpura', value: '#A855F7' },
  { name: 'Fucsia', value: '#D946EF' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Carmesí', value: '#F43F5E' }
]

const HIGHLIGHT_COLORS = [
  { name: 'Amarillo', value: '#FEF08A' },
  { name: 'Verde', value: '#BBF7D0' },
  { name: 'Azul', value: '#BFDBFE' },
  { name: 'Rosa', value: '#FBCFE8' },
  { name: 'Naranja', value: '#FED7AA' },
  { name: 'Púrpura', value: '#DDD6FE' },
  { name: 'Rojo', value: '#FECACA' },
  { name: 'Cian', value: '#A5F3FC' }
]

interface EditorState {
  title: string
  showColorPicker: boolean
  showHighlightPicker: boolean
  showLinkDialog: boolean
  showYoutubeDialog: boolean
  showTableMenu: boolean
  linkUrl: string
  youtubeUrl: string
  isUploadingImage: boolean
  isUploadingVideo: boolean
  isUploadingFile: boolean
}

export function TextEditor({ content, onUpdate }: ContentEditorProps) {
  const contentId = content?.id || ''
  const initialData = parseTextContent(content.content)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const highlightPickerRef = useRef<HTMLDivElement>(null)
  const tableMenuRef = useRef<HTMLDivElement>(null)

  const [state, setState] = useState<EditorState>({
    title: typeof initialData.title === 'string' ? initialData.title : '',
    showColorPicker: false,
    showHighlightPicker: false,
    showLinkDialog: false,
    showYoutubeDialog: false,
    showTableMenu: false,
    linkUrl: '',
    youtubeUrl: '',
    isUploadingImage: false,
    isUploadingVideo: false,
    isUploadingFile: false
  })

  const [isPending, startTransition] = useTransition()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer'
        }
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm'
        }
      }),
      Video.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
          controls: true
        }
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4'
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-border'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted font-semibold p-2 text-left'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2'
        }
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-0'
        }
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-2'
        }
      }),
      Superscript,
      Subscript,
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-4 border-t-2 border-border'
        }
      }),
      Typography.configure({
        openDoubleQuote: '«',
        closeDoubleQuote: '»',
        openSingleQuote: '‘',
        closeSingleQuote: '’'
      }),
      CharacterCount.configure({
        limit: MAX_CONTENT_LENGTH
      }),
      Placeholder.configure({
        placeholder: 'Comienza a escribir tu contenido...'
      })
    ],
    content: typeof initialData.content === 'string' ? initialData.content : ''
  })

  useEffect(() => {
    if (editor && typeof initialData.content === 'string') {
      editor.commands.setContent(initialData.content)
    }
  }, [editor, initialData.content])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setState((prev) => ({ ...prev, showColorPicker: false }))
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target as Node)) {
        setState((prev) => ({ ...prev, showHighlightPicker: false }))
      }
      if (tableMenuRef.current && !tableMenuRef.current.contains(event.target as Node)) {
        setState((prev) => ({ ...prev, showTableMenu: false }))
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTitleChange = useCallback((value: string) => {
    if (typeof value !== 'string') return
    setState((prev) => ({
      ...prev,
      title: value.substring(0, MAX_TITLE_LENGTH)
    }))
  }, [])

  const handleImageUpload = useCallback(async () => {
    if (!editor) return
    imageInputRef.current?.click()
  }, [editor])

  const handleImageSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !editor) return

      setState((prev) => ({ ...prev, isUploadingImage: true }))

      try {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          editor.chain().focus().setImage({ src: base64 }).run()
        }
        reader.readAsDataURL(file)

        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadImage(formData)

        if (result.success && result.url) {
          const { state: editorState } = editor
          editorState.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src.startsWith('data:')) {
              editor.chain().setNodeSelection(pos).updateAttributes('image', { src: result.url }).run()
            }
          })
          toast.success('Imagen subida correctamente')
        } else {
          toast.error(result.error || 'Error al subir la imagen')
        }
      } catch (error) {
        toast.error('Error al subir la imagen')
        console.error(error)
      } finally {
        setState((prev) => ({ ...prev, isUploadingImage: false }))
        if (imageInputRef.current) {
          imageInputRef.current.value = ''
        }
      }
    },
    [editor]
  )

  const handleVideoUpload = useCallback(async () => {
    if (!editor) return
    videoInputRef.current?.click()
  }, [editor])

  const handleVideoSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !editor) return

      setState((prev) => ({ ...prev, isUploadingVideo: true }))

      try {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          editor.chain().focus().setVideo({ src: base64 }).run()
        }
        reader.readAsDataURL(file)

        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadVideo(formData)

        if (result.success && result.url) {
          const { state: editorState } = editor
          editorState.doc.descendants((node, pos) => {
            if (node.type.name === 'video' && node.attrs.src.startsWith('data:')) {
              editor.chain().setNodeSelection(pos).updateAttributes('video', { src: result.url }).run()
            }
          })
          toast.success('Video subido correctamente')
        } else {
          toast.error(result.error || 'Error al subir el video')
        }
      } catch (error) {
        toast.error('Error al subir el video')
        console.error(error)
      } finally {
        setState((prev) => ({ ...prev, isUploadingVideo: false }))
        if (videoInputRef.current) {
          videoInputRef.current.value = ''
        }
      }
    },
    [editor]
  )

  const handleFileUpload = useCallback(async () => {
    if (!editor) return
    fileInputRef.current?.click()
  }, [editor])

  const handleFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !editor) return

      setState((prev) => ({ ...prev, isUploadingFile: true }))

      try {
        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadFile(formData)

        if (result.success && result.url) {
          editor
            .chain()
            .focus()
            .insertContent(`<a href="${result.url}" target="_blank" rel="noopener noreferrer">${file.name}</a>`)
            .run()
          toast.success('Archivo subido correctamente')
        } else {
          toast.error(result.error || 'Error al subir el archivo')
        }
      } catch (error) {
        toast.error('Error al subir el archivo')
        console.error(error)
      } finally {
        setState((prev) => ({ ...prev, isUploadingFile: false }))
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [editor]
  )

  const handleSetLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    setState((prev) => ({
      ...prev,
      showLinkDialog: true,
      linkUrl: previousUrl || ''
    }))
  }, [editor])

  const applyLink = useCallback(() => {
    if (!editor) return

    if (state.linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: state.linkUrl }).run()
    }

    setState((prev) => ({
      ...prev,
      showLinkDialog: false,
      linkUrl: ''
    }))
  }, [editor, state.linkUrl])

  const handleAddYoutube = useCallback(() => {
    setState((prev) => ({ ...prev, showYoutubeDialog: true }))
  }, [])

  const applyYoutube = useCallback(() => {
    if (!editor || !state.youtubeUrl) return

    editor.chain().focus().setYoutubeVideo({ src: state.youtubeUrl }).run()

    setState((prev) => ({
      ...prev,
      showYoutubeDialog: false,
      youtubeUrl: ''
    }))
  }, [editor, state.youtubeUrl])

  const handleSave = useCallback(() => {
    if (!editor) {
      toast.error('El editor no está listo')
      return
    }

    const htmlContent = editor.getHTML()

    if (!htmlContent || htmlContent.trim().length === 0) {
      toast.error('El contenido no puede estar vacío')
      return
    }

    if (htmlContent.length > MAX_CONTENT_LENGTH) {
      toast.error(`El contenido no puede exceder ${MAX_CONTENT_LENGTH} caracteres`)
      return
    }

    try {
      TextContentSchema.parse({
        title: state.title || undefined,
        content: htmlContent
      })
    } catch (validationError) {
      const errorMsg = validationError instanceof Error ? validationError.message : 'Error de validación'
      toast.error(errorMsg)
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('contentId', contentId)
      formData.append('title', state.title || '')
      formData.append('content', htmlContent)

      toast.promise(
        updateLessonContent(formData).then((response) => {
          if (response.success && response.data) {
            onUpdate(contentId, {
              ...content,
              title: state.title,
              content: htmlContent
            })
          }
        }),
        {
          loading: 'Guardando contenido...',
          success: 'Contenido guardado correctamente',
          error: (err) => (err instanceof Error ? err.message : 'Error al guardar')
        }
      )
    })
  }, [editor, state.title, contentId, onUpdate, content])

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    icon: Icon,
    title
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    icon: React.ElementType
    title: string
  }) => (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground disabled:opacity-30'
      } disabled:cursor-not-allowed`}
    >
      <Icon className='w-4 h-4' />
    </button>
  )

  const ToolbarDivider = () => <div className='h-6 w-px bg-border mx-1' />

  if (!contentId || typeof contentId !== 'string') {
    return (
      <div className='flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-md'>
        <span className='text-sm text-destructive'>Error: ID de contenido no válido</span>
      </div>
    )
  }

  if (!editor) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2' />
          <p className='text-sm text-muted-foreground'>Cargando editor...</p>
        </div>
      </div>
    )
  }

  const charCount = editor.storage.characterCount?.characters?.() || 0

  return (
    <div className='space-y-4'>
      <div>
        <label htmlFor='title' className='text-sm font-semibold mb-2 block'>
          Título (opcional)
        </label>
        <div className='relative'>
          <input
            id='title'
            type='text'
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder='Ej: Introducción a React'
            disabled={isPending}
            className='w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'
          />
          <span className='absolute right-3 top-2 text-xs text-muted-foreground'>
            {state.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-semibold block'>Contenido</Label>
        <div className='border border-input rounded-lg overflow-hidden bg-background'>
          <div className='flex items-center gap-1 p-2 bg-secondary border-b border-input flex-wrap'>
            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                disabled={isPending}
                icon={Bold}
                title='Negrita (Ctrl+B)'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                disabled={isPending}
                icon={Italic}
                title='Itálica (Ctrl+I)'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                disabled={isPending}
                icon={UnderlineIcon}
                title='Subrayado (Ctrl+U)'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                disabled={isPending}
                icon={Strikethrough}
                title='Tachado'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                disabled={isPending}
                icon={Code}
                title='Código en línea'
              />
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                isActive={editor.isActive('superscript')}
                disabled={isPending}
                icon={SuperscriptIcon}
                title='Superíndice'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                isActive={editor.isActive('subscript')}
                disabled={isPending}
                icon={SubscriptIcon}
                title='Subíndice'
              />
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1 relative'>
              <ToolbarButton
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showColorPicker: !prev.showColorPicker,
                    showHighlightPicker: false,
                    showTableMenu: false
                  }))
                }
                isActive={state.showColorPicker}
                disabled={isPending}
                icon={Palette}
                title='Color de texto'
              />
              <ToolbarButton
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showHighlightPicker: !prev.showHighlightPicker,
                    showColorPicker: false,
                    showTableMenu: false
                  }))
                }
                isActive={state.showHighlightPicker}
                disabled={isPending}
                icon={Highlighter}
                title='Resaltado'
              />

              {state.showColorPicker && (
                <div
                  ref={colorPickerRef}
                  className='absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-50 flex flex-col gap-2'
                >
                  <div className='text-xs font-medium text-muted-foreground mb-1'>Color de texto</div>
                  <div className='grid grid-cols-5 gap-2 max-w-xs'>
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        type='button'
                        onClick={() => {
                          editor.chain().focus().setColor(color.value).run()
                          setState((prev) => ({ ...prev, showColorPicker: false }))
                        }}
                        className='w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform'
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().unsetColor().run()
                      setState((prev) => ({ ...prev, showColorPicker: false }))
                    }}
                    className='text-xs text-muted-foreground hover:text-foreground mt-1'
                  >
                    Remover color
                  </button>
                </div>
              )}

              {state.showHighlightPicker && (
                <div
                  ref={highlightPickerRef}
                  className='absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-50 flex flex-col gap-2'
                >
                  <div className='text-xs font-medium text-muted-foreground mb-1'>Resaltado</div>
                  <div className='grid grid-cols-4 gap-2'>
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type='button'
                        onClick={() => {
                          editor.chain().focus().setHighlight({ color: color.value }).run()
                          setState((prev) => ({ ...prev, showHighlightPicker: false }))
                        }}
                        className='w-8 h-6 rounded border-2 border-border hover:scale-110 transition-transform'
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run()
                      setState((prev) => ({ ...prev, showHighlightPicker: false }))
                    }}
                    className='text-xs text-muted-foreground hover:text-foreground mt-1'
                  >
                    Remover resaltado
                  </button>
                </div>
              )}
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                disabled={isPending}
                icon={Heading1}
                title='Encabezado 1'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                disabled={isPending}
                icon={Heading2}
                title='Encabezado 2'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                disabled={isPending}
                icon={Heading3}
                title='Encabezado 3'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                isActive={editor.isActive('heading', { level: 4 })}
                disabled={isPending}
                icon={Heading4}
                title='Encabezado 4'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                isActive={editor.isActive('heading', { level: 5 })}
                disabled={isPending}
                icon={Heading5}
                title='Encabezado 5'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                isActive={editor.isActive('heading', { level: 6 })}
                disabled={isPending}
                icon={Heading6}
                title='Encabezado 6'
              />
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                disabled={isPending}
                icon={AlignLeft}
                title='Alinear izquierda'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                disabled={isPending}
                icon={AlignCenter}
                title='Alinear centro'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                disabled={isPending}
                icon={AlignRight}
                title='Alinear derecha'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                disabled={isPending}
                icon={AlignJustify}
                title='Justificar'
              />
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                disabled={isPending}
                icon={List}
                title='Lista con viñetas'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                disabled={isPending}
                icon={ListOrdered}
                title='Lista numerada'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                isActive={editor.isActive('taskList')}
                disabled={isPending}
                icon={ListChecks}
                title='Lista de tareas'
              />
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                disabled={isPending}
                icon={Code2}
                title='Bloque de código'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                disabled={isPending}
                icon={Quote}
                title='Bloque de cita'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                disabled={isPending}
                icon={Minus}
                title='Línea horizontal'
              />
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={handleSetLink}
                isActive={editor.isActive('link')}
                disabled={isPending}
                icon={LinkIcon}
                title='Insertar enlace'
              />
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1 relative'>
              <ToolbarButton
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showTableMenu: !prev.showTableMenu,
                    showColorPicker: false,
                    showHighlightPicker: false
                  }))
                }
                isActive={editor.isActive('table')}
                disabled={isPending}
                icon={TableIcon}
                title='Tabla'
              />

              {state.showTableMenu && (
                <div
                  ref={tableMenuRef}
                  className='absolute top-full left-0 mt-2 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 flex flex-col gap-1'
                >
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                      setState((prev) => ({ ...prev, showTableMenu: false }))
                    }}
                    className='text-xs px-3 py-1.5 rounded hover:bg-secondary text-left'
                  >
                    Insertar tabla 3x3
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().addColumnBefore().run()
                      setState((prev) => ({ ...prev, showTableMenu: false }))
                    }}
                    disabled={!editor.can().addColumnBefore()}
                    className='text-xs px-3 py-1.5 rounded hover:bg-secondary text-left disabled:opacity-50'
                  >
                    Agregar columna antes
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run()
                      setState((prev) => ({ ...prev, showTableMenu: false }))
                    }}
                    disabled={!editor.can().addColumnAfter()}
                    className='text-xs px-3 py-1.5 rounded hover:bg-secondary text-left disabled:opacity-50'
                  >
                    Agregar columna después
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run()
                      setState((prev) => ({ ...prev, showTableMenu: false }))
                    }}
                    disabled={!editor.can().deleteColumn()}
                    className='text-xs px-3 py-1.5 rounded hover:bg-secondary text-left disabled:opacity-50'
                  >
                    Eliminar columna
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().addRowBefore().run()
                      setState((prev) => ({ ...prev, showTableMenu: false }))
                    }}
                    disabled={!editor.can().addRowBefore()}
                    className='text-xs px-3 py-1.5 rounded hover:bg-secondary text-left disabled:opacity-50'
                  >
                    Agregar fila antes
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run()
                      setState((prev) => ({ ...prev, showTableMenu: false }))
                    }}
                    disabled={!editor.can().addRowAfter()}
                    className='text-xs px-3 py-1.5 rounded hover:bg-secondary text-left disabled:opacity-50'
                  >
                    Agregar fila después
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().deleteRow().run()
                      setState((prev) => ({ ...prev, showTableMenu: false }))
                    }}
                    disabled={!editor.can().deleteRow()}
                    className='text-xs px-3 py-1.5 rounded hover:bg-secondary text-left disabled:opacity-50'
                  >
                    Eliminar fila
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      editor.chain().focus().deleteTable().run()
                      setState((prev) => ({ ...prev, showTableMenu: false }))
                    }}
                    disabled={!editor.can().deleteTable()}
                    className='text-xs px-3 py-1.5 rounded hover:bg-secondary text-left text-destructive disabled:opacity-50'
                  >
                    Eliminar tabla
                  </button>
                </div>
              )}
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={handleImageUpload}
                disabled={isPending || state.isUploadingImage}
                icon={ImagePlus}
                title='Subir imagen'
              />
              <input
                ref={imageInputRef}
                type='file'
                accept='image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
                onChange={handleImageSelected}
                className='hidden'
              />

              <ToolbarButton
                onClick={handleVideoUpload}
                disabled={isPending || state.isUploadingVideo}
                icon={VideoIcon}
                title='Subir video'
              />
              <input
                ref={videoInputRef}
                type='file'
                accept='video/mp4,video/webm,video/ogg,video/quicktime'
                onChange={handleVideoSelected}
                className='hidden'
              />

              <ToolbarButton onClick={handleAddYoutube} disabled={isPending} icon={YoutubeIcon} title='Insertar YouTube' />

              <ToolbarButton
                onClick={handleFileUpload}
                disabled={isPending || state.isUploadingFile}
                icon={Paperclip}
                title='Adjuntar archivo'
              />
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
                onChange={handleFileSelected}
                className='hidden'
              />
            </div>

            <ToolbarDivider />

            <div className='flex items-center gap-1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={isPending || !editor.can().undo()}
                icon={Undo2}
                title='Deshacer (Ctrl+Z)'
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={isPending || !editor.can().redo()}
                icon={Redo2}
                title='Rehacer (Ctrl+Y)'
              />
            </div>
          </div>

          <div className='bg-background min-h-96'>
            <EditorContent
              editor={editor}
              className='prose prose-sm max-w-none px-4 py-3 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-96'
            />
          </div>

          <div className='bg-secondary border-t border-input px-4 py-2 flex items-center justify-between text-xs text-muted-foreground'>
            <span>
              {charCount} / {MAX_CONTENT_LENGTH} caracteres
              {charCount >= MAX_CONTENT_LENGTH * 0.9 && <span className='ml-2 text-amber-600 font-medium'>⚠️ Límite próximo</span>}
            </span>
            {(state.isUploadingImage || state.isUploadingVideo || state.isUploadingFile) && (
              <span className='flex items-center gap-2 text-primary'>
                <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-primary' />
                Subiendo archivo...
              </span>
            )}
          </div>
        </div>
      </div>

      {state.showLinkDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
            <h3 className='text-lg font-semibold mb-4'>Insertar enlace</h3>
            <input
              type='url'
              value={state.linkUrl}
              onChange={(e) => setState((prev) => ({ ...prev, linkUrl: e.target.value }))}
              placeholder='https://ejemplo.com'
              className='w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-4'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyLink()
                }
              }}
            />
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showLinkDialog: false,
                    linkUrl: ''
                  }))
                }
              >
                Cancelar
              </Button>
              <Button onClick={applyLink}>Aplicar</Button>
            </div>
          </div>
        </div>
      )}

      {state.showYoutubeDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
            <h3 className='text-lg font-semibold mb-4'>Insertar video de YouTube</h3>
            <input
              type='url'
              value={state.youtubeUrl}
              onChange={(e) => setState((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
              placeholder='https://www.youtube.com/watch?v=...'
              className='w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-4'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyYoutube()
                }
              }}
            />
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showYoutubeDialog: false,
                    youtubeUrl: ''
                  }))
                }
              >
                Cancelar
              </Button>
              <Button onClick={applyYoutube}>Insertar</Button>
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={isPending || !editor} className='w-full' size='lg'>
        {isPending ? (
          <span className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-background' />
            Guardando...
          </span>
        ) : (
          'Guardar contenido'
        )}
      </Button>
    </div>
  )
}

// 'use client'

// import { CharacterCount } from '@tiptap/extension-character-count'
// import { Color } from '@tiptap/extension-color'
// import { Highlight } from '@tiptap/extension-highlight'
// import Image from '@tiptap/extension-image'
// import Link from '@tiptap/extension-link'
// import Placeholder from '@tiptap/extension-placeholder'
// import { TextAlign } from '@tiptap/extension-text-align'
// import { TextStyle } from '@tiptap/extension-text-style'
// import Underline from '@tiptap/extension-underline'
// import { EditorContent, useEditor } from '@tiptap/react'
// import StarterKit from '@tiptap/starter-kit'
// import {
//   AlignCenter,
//   AlignJustify,
//   AlignLeft,
//   AlignRight,
//   Bold,
//   Code2,
//   Heading1,
//   Heading2,
//   Heading3,
//   Highlighter,
//   ImagePlus,
//   Italic,
//   Link as LinkIcon,
//   List,
//   ListOrdered,
//   Palette,
//   Quote,
//   Redo2,
//   Strikethrough,
//   Underline as UnderlineIcon,
//   Undo2
// } from 'lucide-react'
// import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
// import { toast } from 'sonner'
// import { updateLessonContent } from '@/actions/courseActions'
// import { Button } from '@/components/ui/button'
// import { Label } from '@/components/ui/label'
// import { parseTextContent, TextContentSchema } from '@/lib/content-validators'
// import { createImagePreview, isValidImageFile, uploadImage } from '@/lib/image-upload-utils'
// import type { ContentEditorProps } from './types'

// const MAX_TITLE_LENGTH = 255
// const MAX_CONTENT_LENGTH = 50000

// const COLORS = [
//   { name: 'Negro', value: '#000000' },
//   { name: 'Gris', value: '#6B7280' },
//   { name: 'Rojo', value: '#EF4444' },
//   { name: 'Naranja', value: '#F97316' },
//   { name: 'Amarillo', value: '#EAB308' },
//   { name: 'Verde', value: '#10B981' },
//   { name: 'Azul', value: '#3B82F6' },
//   { name: 'Índigo', value: '#6366F1' },
//   { name: 'Púrpura', value: '#A855F7' },
//   { name: 'Rosa', value: '#EC4899' }
// ]

// const HIGHLIGHT_COLORS = [
//   { name: 'Amarillo', value: '#FEF08A' },
//   { name: 'Verde', value: '#BBF7D0' },
//   { name: 'Azul', value: '#BFDBFE' },
//   { name: 'Rosa', value: '#FBCFE8' },
//   { name: 'Naranja', value: '#FED7AA' },
//   { name: 'Púrpura', value: '#DDD6FE' }
// ]

// interface TextEditorState {
//   title: string
//   showColorPicker: boolean
//   showHighlightPicker: boolean
//   showLinkDialog: boolean
//   linkUrl: string
//   isUploadingImage: boolean
// }

// export function TextEditor({ content, onUpdate }: ContentEditorProps) {
//   const contentId = content?.id || ''
//   const initialData = parseTextContent(content.contenido)
//   const imageInputRef = useRef<HTMLInputElement>(null)
//   const colorPickerRef = useRef<HTMLDivElement>(null)
//   const highlightPickerRef = useRef<HTMLDivElement>(null)

//   const [state, setState] = useState<TextEditorState>({
//     title: typeof initialData.titulo === 'string' ? initialData.titulo : '',
//     showColorPicker: false,
//     showHighlightPicker: false,
//     showLinkDialog: false,
//     linkUrl: '',
//     isUploadingImage: false
//   })

//   const [isPending, startTransition] = useTransition()

//   const editor = useEditor({
//     immediatelyRender: false,
//     extensions: [
//       StarterKit.configure({
//         heading: {
//           levels: [1, 2, 3]
//         }
//       }),
//       Underline,
//       TextStyle,
//       Color,
//       Highlight.configure({
//         multicolor: true
//       }),
//       TextAlign.configure({
//         types: ['heading', 'paragraph']
//       }),
//       Link.configure({
//         openOnClick: false,
//         autolink: true,
//         HTMLAttributes: {
//           class: 'text-primary underline'
//         }
//       }),
//       Image.configure({
//         inline: false,
//         allowBase64: true,
//         HTMLAttributes: {
//           class: 'max-w-full h-auto rounded-lg'
//         }
//       }),
//       CharacterCount.configure({
//         limit: MAX_CONTENT_LENGTH
//       }),
//       Placeholder.configure({
//         placeholder: 'Comienza a escribir tu contenido...'
//       })
//     ],
//     content: typeof initialData.contenido === 'string' ? initialData.contenido : ''
//   })

//   useEffect(() => {
//     if (editor && typeof initialData.contenido === 'string') {
//       editor.commands.setContent(initialData.contenido)
//     }
//   }, [editor, initialData.contenido])

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
//         setState((prev) => ({ ...prev, showColorPicker: false }))
//       }
//       if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target as Node)) {
//         setState((prev) => ({ ...prev, showHighlightPicker: false }))
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   const handleTitleChange = useCallback((value: string) => {
//     if (typeof value !== 'string') return
//     setState((prev) => ({
//       ...prev,
//       title: value.substring(0, MAX_TITLE_LENGTH)
//     }))
//   }, [])

//   const handleImageUpload = useCallback(async () => {
//     if (!editor) return
//     imageInputRef.current?.click()
//   }, [editor])

//   const handleImageSelected = useCallback(
//     async (event: React.ChangeEvent<HTMLInputElement>) => {
//       const file = event.target.files?.[0]
//       if (!file || !editor) return

//       if (!isValidImageFile(file)) {
//         toast.error('Archivo inválido. Usa JPG, PNG, GIF o WEBP (máx. 5MB)')
//         return
//       }

//       setState((prev) => ({ ...prev, isUploadingImage: true }))

//       try {
//         const preview = await createImagePreview(file)
//         editor.chain().focus().setImage({ src: preview }).run()

//         const url = await uploadImage(file)
//         const { state: editorState } = editor

//         editorState.doc.descendants((node, pos) => {
//           if (node.type.name === 'image' && node.attrs.src === preview) {
//             editor.chain().setNodeSelection(pos).updateAttributes('image', { src: url }).run()
//           }
//         })

//         toast.success('Imagen subida correctamente')
//       } catch (error) {
//         toast.error('Error al subir la imagen')
//         console.error(error)
//       } finally {
//         setState((prev) => ({ ...prev, isUploadingImage: false }))
//         if (imageInputRef.current) {
//           imageInputRef.current.value = ''
//         }
//       }
//     },
//     [editor]
//   )

//   const handleSetLink = useCallback(() => {
//     if (!editor) return

//     const previousUrl = editor.getAttributes('link').href
//     setState((prev) => ({
//       ...prev,
//       showLinkDialog: true,
//       linkUrl: previousUrl || ''
//     }))
//   }, [editor])

//   const applyLink = useCallback(() => {
//     if (!editor) return

//     if (state.linkUrl === '') {
//       editor.chain().focus().extendMarkRange('link').unsetLink().run()
//     } else {
//       editor.chain().focus().extendMarkRange('link').setLink({ href: state.linkUrl }).run()
//     }

//     setState((prev) => ({
//       ...prev,
//       showLinkDialog: false,
//       linkUrl: ''
//     }))
//   }, [editor, state.linkUrl])

//   const handleSave = useCallback(() => {
//     if (!editor) {
//       toast.error('El editor no está listo')
//       return
//     }

//     const htmlContent = editor.getHTML()

//     if (!htmlContent || htmlContent.trim().length === 0) {
//       toast.error('El contenido no puede estar vacío')
//       return
//     }

//     if (htmlContent.length > MAX_CONTENT_LENGTH) {
//       toast.error(`El contenido no puede exceder ${MAX_CONTENT_LENGTH} caracteres`)
//       return
//     }

//     try {
//       TextContentSchema.parse({
//         titulo: state.title || undefined,
//         contenido: htmlContent
//       })
//     } catch (validationError) {
//       const errorMsg = validationError instanceof Error ? validationError.message : 'Error de validación'
//       toast.error(errorMsg)
//       return
//     }

//     startTransition(async () => {
//       toast.promise(
//         updateLessonContent(contentId, {
//           titulo: state.title || undefined,
//           contenido: htmlContent
//         }).then(() => {
//           onUpdate(contentId, {
//             ...content,
//             titulo: state.title,
//             contenido: htmlContent
//           })
//         }),
//         {
//           loading: 'Guardando contenido...',
//           success: 'Contenido guardado correctamente',
//           error: (err) => (err instanceof Error ? err.message : 'Error al guardar')
//         }
//       )
//     })
//   }, [editor, state.title, contentId, onUpdate, content])

//   const ToolbarButton = ({
//     onClick,
//     isActive,
//     disabled,
//     icon: Icon,
//     title
//   }: {
//     onClick: () => void
//     isActive?: boolean
//     disabled?: boolean
//     icon: React.ElementType
//     title: string
//   }) => (
//     <button
//       type='button'
//       onClick={onClick}
//       disabled={disabled}
//       title={title}
//       className={`p-2 rounded-md transition-colors ${
//         isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground disabled:opacity-30'
//       } disabled:cursor-not-allowed`}
//     >
//       <Icon className='w-4 h-4' />
//     </button>
//   )

//   const ToolbarDivider = () => <div className='h-6 w-px bg-border mx-1' />

//   if (!contentId || typeof contentId !== 'string') {
//     return (
//       <div className='flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-md'>
//         <span className='text-sm text-destructive'>Error: ID de contenido no válido</span>
//       </div>
//     )
//   }

//   if (!editor) {
//     return (
//       <div className='flex items-center justify-center p-8'>
//         <div className='text-center'>
//           <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2' />
//           <p className='text-sm text-muted-foreground'>Cargando editor...</p>
//         </div>
//       </div>
//     )
//   }

//   const charCount = editor.storage.characterCount?.characters?.() || 0

//   return (
//     <div className='space-y-4'>
//       <div>
//         <label htmlFor='title' className='text-sm font-semibold mb-2 block'>
//           Título (opcional)
//         </label>
//         <div className='relative'>
//           <input
//             id='title'
//             type='text'
//             value={state.title}
//             onChange={(e) => handleTitleChange(e.target.value)}
//             maxLength={MAX_TITLE_LENGTH}
//             placeholder='Ej: Introducción a React'
//             disabled={isPending}
//             className='w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'
//           />
//           <span className='absolute right-3 top-2 text-xs text-muted-foreground'>
//             {state.title.length}/{MAX_TITLE_LENGTH}
//           </span>
//         </div>
//       </div>

//       <div className='space-y-2'>
//         <Label className='text-sm font-semibold block'>Contenido</Label>
//         <div className='border border-input rounded-lg overflow-hidden bg-background'>
//           <div className='flex items-center gap-1 p-2 bg-secondary border-b border-input flex-wrap'>
//             <div className='flex items-center gap-1'>
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleBold().run()}
//                 isActive={editor.isActive('bold')}
//                 disabled={isPending}
//                 icon={Bold}
//                 title='Negrita (Ctrl+B)'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleItalic().run()}
//                 isActive={editor.isActive('italic')}
//                 disabled={isPending}
//                 icon={Italic}
//                 title='Itálica (Ctrl+I)'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleUnderline().run()}
//                 isActive={editor.isActive('underline')}
//                 disabled={isPending}
//                 icon={UnderlineIcon}
//                 title='Subrayado (Ctrl+U)'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleStrike().run()}
//                 isActive={editor.isActive('strike')}
//                 disabled={isPending}
//                 icon={Strikethrough}
//                 title='Tachado'
//               />
//             </div>

//             <ToolbarDivider />

//             <div className='flex items-center gap-1 relative'>
//               <ToolbarButton
//                 onClick={() =>
//                   setState((prev) => ({ ...prev, showColorPicker: !prev.showColorPicker, showHighlightPicker: false }))
//                 }
//                 isActive={state.showColorPicker}
//                 disabled={isPending}
//                 icon={Palette}
//                 title='Color de texto'
//               />
//               <ToolbarButton
//                 onClick={() =>
//                   setState((prev) => ({ ...prev, showHighlightPicker: !prev.showHighlightPicker, showColorPicker: false }))
//                 }
//                 isActive={state.showHighlightPicker}
//                 disabled={isPending}
//                 icon={Highlighter}
//                 title='Resaltado'
//               />

//               {state.showColorPicker && (
//                 <div
//                   ref={colorPickerRef}
//                   className='absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-50 flex flex-col gap-2'
//                 >
//                   <div className='text-xs font-medium text-muted-foreground mb-1'>Color de texto</div>
//                   <div className='grid grid-cols-5 gap-2'>
//                     {COLORS.map((color) => (
//                       <button
//                         key={color.value}
//                         type='button'
//                         onClick={() => {
//                           editor.chain().focus().setColor(color.value).run()
//                           setState((prev) => ({ ...prev, showColorPicker: false }))
//                         }}
//                         className='w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform'
//                         style={{ backgroundColor: color.value }}
//                         title={color.name}
//                       />
//                     ))}
//                   </div>
//                   <button
//                     type='button'
//                     onClick={() => {
//                       editor.chain().focus().unsetColor().run()
//                       setState((prev) => ({ ...prev, showColorPicker: false }))
//                     }}
//                     className='text-xs text-muted-foreground hover:text-foreground mt-1'
//                   >
//                     Remover color
//                   </button>
//                 </div>
//               )}

//               {state.showHighlightPicker && (
//                 <div
//                   ref={highlightPickerRef}
//                   className='absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-50 flex flex-col gap-2'
//                 >
//                   <div className='text-xs font-medium text-muted-foreground mb-1'>Resaltado</div>
//                   <div className='grid grid-cols-3 gap-2'>
//                     {HIGHLIGHT_COLORS.map((color) => (
//                       <button
//                         key={color.value}
//                         type='button'
//                         onClick={() => {
//                           editor.chain().focus().setHighlight({ color: color.value }).run()
//                           setState((prev) => ({ ...prev, showHighlightPicker: false }))
//                         }}
//                         className='w-8 h-6 rounded border-2 border-border hover:scale-110 transition-transform'
//                         style={{ backgroundColor: color.value }}
//                         title={color.name}
//                       />
//                     ))}
//                   </div>
//                   <button
//                     type='button'
//                     onClick={() => {
//                       editor.chain().focus().unsetHighlight().run()
//                       setState((prev) => ({ ...prev, showHighlightPicker: false }))
//                     }}
//                     className='text-xs text-muted-foreground hover:text-foreground mt-1'
//                   >
//                     Remover resaltado
//                   </button>
//                 </div>
//               )}
//             </div>

//             <ToolbarDivider />

//             <div className='flex items-center gap-1'>
//               <ToolbarButton
//                 onClick={() =>
//                   editor
//                     .chain()
//                     .focus()
//                     .toggleHeading({
//                       level: 1
//                     })
//                     .run()
//                 }
//                 isActive={editor.isActive('heading', {
//                   level: 1
//                 })}
//                 disabled={isPending}
//                 icon={Heading1}
//                 title='Encabezado 1'
//               />
//               <ToolbarButton
//                 onClick={() =>
//                   editor
//                     .chain()
//                     .focus()
//                     .toggleHeading({
//                       level: 2
//                     })
//                     .run()
//                 }
//                 isActive={editor.isActive('heading', {
//                   level: 2
//                 })}
//                 disabled={isPending}
//                 icon={Heading2}
//                 title='Encabezado 2'
//               />
//               <ToolbarButton
//                 onClick={() =>
//                   editor
//                     .chain()
//                     .focus()
//                     .toggleHeading({
//                       level: 3
//                     })
//                     .run()
//                 }
//                 isActive={editor.isActive('heading', {
//                   level: 3
//                 })}
//                 disabled={isPending}
//                 icon={Heading3}
//                 title='Encabezado 3'
//               />
//             </div>

//             <ToolbarDivider />

//             <div className='flex items-center gap-1'>
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().setTextAlign('left').run()}
//                 isActive={editor.isActive({ textAlign: 'left' })}
//                 disabled={isPending}
//                 icon={AlignLeft}
//                 title='Alinear izquierda'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().setTextAlign('center').run()}
//                 isActive={editor.isActive({ textAlign: 'center' })}
//                 disabled={isPending}
//                 icon={AlignCenter}
//                 title='Alinear centro'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().setTextAlign('right').run()}
//                 isActive={editor.isActive({ textAlign: 'right' })}
//                 disabled={isPending}
//                 icon={AlignRight}
//                 title='Alinear derecha'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().setTextAlign('justify').run()}
//                 isActive={editor.isActive({ textAlign: 'justify' })}
//                 disabled={isPending}
//                 icon={AlignJustify}
//                 title='Justificar'
//               />
//             </div>

//             <ToolbarDivider />

//             <div className='flex items-center gap-1'>
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleBulletList().run()}
//                 isActive={editor.isActive('bulletList')}
//                 disabled={isPending}
//                 icon={List}
//                 title='Lista con viñetas'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleOrderedList().run()}
//                 isActive={editor.isActive('orderedList')}
//                 disabled={isPending}
//                 icon={ListOrdered}
//                 title='Lista numerada'
//               />
//             </div>

//             <ToolbarDivider />

//             <div className='flex items-center gap-1'>
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleCodeBlock().run()}
//                 isActive={editor.isActive('codeBlock')}
//                 disabled={isPending}
//                 icon={Code2}
//                 title='Bloque de código'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleBlockquote().run()}
//                 isActive={editor.isActive('blockquote')}
//                 disabled={isPending}
//                 icon={Quote}
//                 title='Bloque de cita'
//               />
//               <ToolbarButton
//                 onClick={handleSetLink}
//                 isActive={editor.isActive('link')}
//                 disabled={isPending}
//                 icon={LinkIcon}
//                 title='Insertar enlace'
//               />
//             </div>

//             <ToolbarDivider />

//             <div className='flex items-center gap-1'>
//               <ToolbarButton
//                 onClick={handleImageUpload}
//                 disabled={isPending || state.isUploadingImage}
//                 icon={ImagePlus}
//                 title='Subir imagen'
//               />
//               <input
//                 ref={imageInputRef}
//                 type='file'
//                 accept='image/jpeg,image/png,image/gif,image/webp'
//                 onChange={handleImageSelected}
//                 className='hidden'
//               />
//             </div>

//             <ToolbarDivider />

//             <div className='flex items-center gap-1'>
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().undo().run()}
//                 disabled={isPending || !editor.can().undo()}
//                 icon={Undo2}
//                 title='Deshacer (Ctrl+Z)'
//               />
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().redo().run()}
//                 disabled={isPending || !editor.can().redo()}
//                 icon={Redo2}
//                 title='Rehacer (Ctrl+Y)'
//               />
//             </div>
//           </div>

//           <div className='bg-background min-h-80'>
//             <EditorContent
//               editor={editor}
//               className='prose prose-sm max-w-none px-4 py-3 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-80'
//             />
//           </div>

//           <div className='bg-secondary border-t border-input px-4 py-2 flex items-center justify-between text-xs text-muted-foreground'>
//             <span>
//               {charCount} / {MAX_CONTENT_LENGTH} caracteres
//               {charCount >= MAX_CONTENT_LENGTH * 0.9 && <span className='ml-2 text-amber-600 font-medium'>⚠️ Límite próximo</span>}
//             </span>
//             {state.isUploadingImage && (
//               <span className='flex items-center gap-2 text-primary'>
//                 <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-primary' />
//                 Subiendo imagen...
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {state.showLinkDialog && (
//         <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
//           <div className='bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
//             <h3 className='text-lg font-semibold mb-4'>Insertar enlace</h3>
//             <input
//               type='url'
//               value={state.linkUrl}
//               onChange={(e) => setState((prev) => ({ ...prev, linkUrl: e.target.value }))}
//               placeholder='https://ejemplo.com'
//               className='w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-4'
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') {
//                   applyLink()
//                 }
//               }}
//             />
//             <div className='flex gap-2 justify-end'>
//               <Button
//                 variant='outline'
//                 onClick={() =>
//                   setState((prev) => ({
//                     ...prev,
//                     showLinkDialog: false,
//                     linkUrl: ''
//                   }))
//                 }
//               >
//                 Cancelar
//               </Button>
//               <Button onClick={applyLink}>Aplicar</Button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Button onClick={handleSave} disabled={isPending || !editor} className='w-full' size='lg'>
//         {isPending ? (
//           <span className='flex items-center gap-2'>
//             <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-background' />
//             Guardando...
//           </span>
//         ) : (
//           'Guardar contenido'
//         )}
//       </Button>
//     </div>
//   )
// }
