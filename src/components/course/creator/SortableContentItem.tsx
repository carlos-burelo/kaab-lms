'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ContentType } from '@prisma/client'
import { Code2, FileText, GripVertical, Image, Link2, Music, Trash2Icon, Video } from 'lucide-react'
import type { getLessonById } from '@/actions/courseActions'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { CodeEditor } from './editors/CodeEditor'
import { DocumentEditor } from './editors/DocumentEditor'
import { ImageEditor } from './editors/ImageEditor'
import { LinkEditor } from './editors/LinkEditor'
import { TextEditor } from './editors/TextEditor'
import { VideoEditor } from './editors/VideoEditor'

type LessonResponse = Awaited<ReturnType<typeof getLessonById>>
type ContentItem = NonNullable<LessonResponse['data']>['contents'][number]
interface SortableContentItemProps {
  content: ContentItem
  // lessonId: string
  onUpdate: (contentId: string, data: Partial<ContentItem>) => void
  onDelete: (contentId: string) => void
}
const contentTypeConfig: Record<
  ContentType,
  {
    label: string
    icon: React.ReactNode
    color: string
  }
> = {
  [ContentType.TEXT]: {
    label: 'Texto',
    icon: <FileText className='w-4 h-4' />,
    color: 'bg-blue-100 text-blue-700'
  },
  [ContentType.VIDEO_URL]: {
    label: 'Video URL',
    icon: <Video className='w-4 h-4' />,
    color: 'bg-red-100 text-red-700'
  },
  [ContentType.VIDEO_EMBED]: {
    label: 'Video',
    icon: <Video className='w-4 h-4' />,
    color: 'bg-red-100 text-red-700'
  },
  [ContentType.IMAGE]: {
    label: 'Imagen',
    icon: <Image className='w-4 h-4' />,
    color: 'bg-purple-100 text-purple-700'
  },
  [ContentType.AUDIO]: {
    label: 'Audio',
    icon: <Music className='w-4 h-4' />,
    color: 'bg-amber-100 text-amber-700'
  },
  [ContentType.CODE]: {
    label: 'Código',
    icon: <Code2 className='w-4 h-4' />,
    color: 'bg-slate-100 text-slate-700'
  },
  [ContentType.DOCUMENT]: {
    label: 'Documento',
    icon: <FileText className='w-4 h-4' />,
    color: 'bg-orange-100 text-orange-700'
  },
  [ContentType.LINK]: {
    label: 'Enlace',
    icon: <Link2 className='w-4 h-4' />,
    color: 'bg-green-100 text-green-700'
  }
}
export function SortableContentItem({ content, onUpdate, onDelete }: SortableContentItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: content.id
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }
  const config = contentTypeConfig[content.type as ContentType]
  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
      onDelete(content.id)
    }
  }
  const renderEditor = () => {
    switch (content.type) {
      case ContentType.TEXT:
        return <TextEditor content={content} onUpdate={onUpdate} />
      case ContentType.VIDEO_URL:
      case ContentType.VIDEO_EMBED:
        return <VideoEditor content={content} onUpdate={onUpdate} />
      case ContentType.IMAGE:
        return <ImageEditor content={content} onUpdate={onUpdate} />
      case ContentType.CODE:
        return <CodeEditor content={content} onUpdate={onUpdate} />
      case ContentType.DOCUMENT:
      case ContentType.AUDIO:
        return <DocumentEditor content={content} onUpdate={onUpdate} />
      case ContentType.LINK:
        return <LinkEditor content={content} onUpdate={onUpdate} />
      default:
        return <div className='text-muted-foreground text-sm'>Editor no disponible</div>
    }
  }
  return (
    <div ref={setNodeRef} style={style} className='transition-opacity'>
      <Accordion type='single' collapsible defaultValue={content.id} className='border rounded-lg overflow-hidden'>
        <AccordionItem value={content.id} className='border-0'>
          <div className='flex justify-between items-center gap-2 bg-secondary/50 hover:bg-secondary transition-colors'>
            <div className='flex gap-2 items-center justify-between'>
              <div {...attributes} {...listeners} className='cursor-grab active:cursor-grabbing pl-3 py-4'>
                <GripVertical className='w-5 h-5 text-muted-foreground hover:text-foreground' />
              </div>

              <AccordionTrigger className='flex-1 hover:no-underline gap-3 py-0 px-3'>
                <div className='flex items-center gap-3 flex-1 min-w-0'>
                  <div className='flex gap-2 items-center'>
                    <div className='shrink-0'>{config.icon}</div>
                    <div className='flex-1 min-w-0 text-left'>
                      <p className='font-semibold truncate'>{content.title || config.label}</p>
                    </div>
                  </div>
                  <div className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>{config.label}</div>
                </div>
              </AccordionTrigger>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleDelete}
              className='mr-3 hover:bg-destructive/10 hover:text-destructive'
              title='Eliminar contenido'
            >
              <Trash2Icon className='w-4 h-4' />
            </Button>
          </div>

          <AccordionContent className='p-4 border-t bg-background'>{renderEditor()}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
