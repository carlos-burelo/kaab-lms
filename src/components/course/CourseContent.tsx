'use client'

import type { LessonContent } from '@prisma/client'
import { Download, ExternalLink, FileText, Music } from 'lucide-react'
import Image from 'next/image'
import CodeBlock from '../media/code'
import VideoPlayer from '../media/video'

// Helpers para parsear contenido según su tipo
const parseTextContent = (contenido: string) => {
  try {
    const parsed = JSON.parse(contenido)
    return { titulo: parsed.titulo, contenido: parsed.contenido }
  } catch {
    return { titulo: '', contenido }
  }
}

const parseVideoContent = (contenido: string) => {
  try {
    const parsed = JSON.parse(contenido)
    return { url: parsed.url, embed: parsed.embed, type: parsed.type }
  } catch {
    return { url: contenido, embed: '', type: 'url' }
  }
}

const parseImageContent = (contenido: string) => {
  try {
    const parsed = JSON.parse(contenido)
    return { url: parsed.url, alt: parsed.alt }
  } catch {
    return { url: contenido, alt: '' }
  }
}

const parseCodeContent = (contenido: string) => {
  try {
    const parsed = JSON.parse(contenido)
    return { code: parsed.code, language: parsed.language }
  } catch {
    return { code: contenido, language: 'javascript' }
  }
}

const parseLinkContent = (contenido: string) => {
  try {
    const parsed = JSON.parse(contenido)
    return { url: parsed.url, description: parsed.description }
  } catch {
    return { url: contenido, description: '' }
  }
}

const parseDocumentContent = (contenido: string) => {
  try {
    const parsed = JSON.parse(contenido)
    return { url: parsed.url, name: parsed.name, size: parsed.size }
  } catch {
    return { url: contenido, name: 'Archivo', size: 0 }
  }
}

// Componentes para cada tipo
const TextContentView = ({ contenido }: { contenido: string }) => {
  const { titulo, contenido: html } = parseTextContent(contenido)
  return (
    <div className='space-y-2'>
      {titulo && <h3 className='text-lg font-semibold'>{titulo}</h3>}
      <div className='prose prose-zinc leading-7 dark:prose-invert max-w-none' dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

const ImageContentView = ({ contenido }: { contenido: string }) => {
  const { url, alt } = parseImageContent(contenido)
  return (
    <div className='relative aspect-video w-full rounded-lg overflow-hidden bg-muted'>
      <Image src={url} alt={alt || 'Contenido de la lección'} fill className='object-cover' priority />
    </div>
  )
}

const VideoContentView = ({ contenido }: { contenido: string }) => {
  const { url, embed, type } = parseVideoContent(contenido)

  if (type === 'embed' && embed) {
    return (
      <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-muted'>
        <div dangerouslySetInnerHTML={{ __html: embed }} className='w-full h-full' />
      </div>
    )
  }

  if (url) {
    return <VideoPlayer videoUrl={url} />
  }

  return <div className='p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg'>Video no disponible</div>
}

const CodeContentView = ({ contenido }: { contenido: string }) => {
  const { code, language } = parseCodeContent(contenido)
  return <CodeBlock code={code} language={language} />
}

const LinkContentView = ({ contenido }: { contenido: string }) => {
  const { url, description } = parseLinkContent(contenido)

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='block p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <ExternalLink className='h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0' />
            <p className='font-medium text-blue-800 dark:text-blue-200 truncate'>Recurso Externo</p>
          </div>
          {description && <p className='text-sm text-blue-700 dark:text-blue-300 line-clamp-2'>{description}</p>}
          <p className='text-xs text-blue-600 dark:text-blue-400 mt-1 truncate'>{url}</p>
        </div>
        <ExternalLink className='h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-1' />
      </div>
    </a>
  )
}

const DocumentContentView = ({ contenido }: { contenido: string }) => {
  const { url, name, size } = parseDocumentContent(contenido)
  const sizeMB = size ? (size / 1024 / 1024).toFixed(2) : '?'

  return (
    <a
      href={url}
      download
      className='block p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <FileText className='h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0' />
            <p className='font-medium text-amber-800 dark:text-amber-200 truncate'>{name}</p>
          </div>
          <p className='text-xs text-amber-600 dark:text-amber-400'>{sizeMB} MB • Haz clic para descargar</p>
        </div>
        <Download className='h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-1' />
      </div>
    </a>
  )
}

const AudioContentView = ({ contenido }: { contenido: string }) => {
  const { url, name } = parseDocumentContent(contenido)

  return (
    <div className='space-y-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg'>
      <div className='flex items-center gap-2'>
        <Music className='h-4 w-4 text-purple-600 dark:text-purple-400' />
        <p className='font-medium text-purple-800 dark:text-purple-200 truncate'>{name}</p>
      </div>
      <audio controls className='w-full'>
        <source src={url} />
        <track kind='captions' />
        Tu navegador no soporta audio HTML5
      </audio>
    </div>
  )
}

export function CourseContent({ content, type, title }: LessonContent) {
  return (
    <div className='space-y-2'>
      {title && <h3 className='text-lg font-semibold'>{title}</h3>}
      <div className='space-y-4'>
        {type === 'TEXT' && <TextContentView contenido={content} />}
        {type === 'IMAGE' && <ImageContentView contenido={content} />}
        {(type === 'VIDEO_URL' || type === 'VIDEO_EMBED') && <VideoContentView contenido={content} />}
        {type === 'CODE' && <CodeContentView contenido={content} />}
        {type === 'LINK' && <LinkContentView contenido={content} />}
        {type === 'DOCUMENT' && <DocumentContentView contenido={content} />}
        {type === 'AUDIO' && <AudioContentView contenido={content} />}
        {!['TEXT', 'IMAGE', 'VIDEO_URL', 'VIDEO_EMBED', 'CODE', 'LINK', 'DOCUMENT', 'AUDIO'].includes(type) && (
          <p className='text-red-500'>Tipo de contenido no soportado: {type}</p>
        )}
      </div>
    </div>
  )
}
