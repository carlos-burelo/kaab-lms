'use client'

import { ContentType } from '@prisma/client'
import { Code, FileText, Image, Link2, Music, Video, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContentTypeSelectorProps {
  onSelect: (tipo: ContentType) => void
  onCancel: () => void
}

const contentTypes = [
  {
    type: ContentType.TEXT,
    label: 'Texto',
    description: 'Editor de texto enriquecido con formato',
    icon: FileText,
    color: 'text-blue-600 bg-blue-500/15 hover:bg-blue-500/30'
  },
  {
    type: ContentType.VIDEO_URL,
    label: 'Video (URL)',
    description: 'YouTube, Vimeo u otra plataforma',
    icon: Video,
    color: 'text-red-600 bg-red-500/15 hover:bg-red-500/30'
  },
  {
    type: ContentType.VIDEO_EMBED,
    label: 'Video (Subir)',
    description: 'Sube tu propio archivo de video',
    icon: Video,
    color: 'text-purple-600 bg-purple-500/15 hover:bg-purple-500/30'
  },
  {
    type: ContentType.IMAGE,
    label: 'Imagen',
    description: 'Sube imágenes o diagramas',
    icon: Image,
    color: 'text-green-600 bg-green-500/15 hover:bg-green-500/30'
  },
  {
    type: ContentType.CODE,
    label: 'Código',
    description: 'Bloques de código con resaltado',
    icon: Code,
    color: 'text-gray-600 border-muted-foreground/20 hover:bg-gray-500/30'
  },
  {
    type: ContentType.DOCUMENT,
    label: 'Documento',
    description: 'PDF, Word, presentaciones, etc.',
    icon: FileText,
    color: 'text-orange-600 bg-orange-500/15 hover:bg-orange-500/30'
  },
  {
    type: ContentType.AUDIO,
    label: 'Audio',
    description: 'Archivos de audio o podcasts',
    icon: Music,
    color: 'text-pink-600 bg-pink-500/15 hover:bg-pink-500/30'
  },
  {
    type: ContentType.LINK,
    label: 'Enlace',
    description: 'Enlaces a recursos externos',
    icon: Link2,
    color: 'text-indigo-600 bg-indigo-500/15 hover:bg-indigo-500/30'
  }
]

export function ContentTypeSelector({ onSelect, onCancel }: ContentTypeSelectorProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-lg'>Selecciona el tipo de contenido</h3>
        <Button variant='ghost' size='sm' onClick={onCancel}>
          <X className='w-4 h-4' />
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
        {contentTypes.map(({ type, label, description, icon: Icon, color }) => (
          <button
            key={type}
            type='button'
            onClick={() => onSelect(type)}
            className={`p-4 rounded-lg border-2 border-transparent transition-all text-left ${color}`}
          >
            <Icon className='w-6 h-6 mb-2' />
            <h4 className='font-semibold text-sm mb-1'>{label}</h4>
            <p className='text-xs opacity-80'>{description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
