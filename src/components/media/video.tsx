'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const LiteYouTube = dynamic(() => import('@/components/utils/LiteYoutube'), { ssr: false })

interface VideoPlayerProps {
  videoUrl: string
}

// Extrae video ID de YouTube
const getYouTubeId = (url: string): string | null => {
  try {
    const urlObj = new URL(url)

    // youtube.com?v=ID
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v')
    }

    // youtu.be/ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1)
    }
  } catch {
    // Intentar formato simple
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    return match?.[1] || null
  }

  return null
}

// Extrae video ID de Vimeo
const getVimeoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url)

    if (urlObj.hostname.includes('vimeo.com')) {
      return urlObj.pathname.split('/').filter(Boolean)[0]
    }
  } catch {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match?.[1] || null
  }

  return null
}

// Detecta si es archivo de video local
const isLocalVideo = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov|mkv)$/i.test(url)
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoType = useMemo(() => {
    if (!videoUrl) return null

    const youtubeId = getYouTubeId(videoUrl)
    if (youtubeId) return { type: 'youtube', id: youtubeId }

    const vimeoId = getVimeoId(videoUrl)
    if (vimeoId) return { type: 'vimeo', id: vimeoId }

    if (isLocalVideo(videoUrl)) return { type: 'local', url: videoUrl }

    // Por defecto, asumir que es una URL embebible
    return { type: 'iframe', url: videoUrl }
  }, [videoUrl])

  if (!videoType) {
    return (
      <div className='aspect-video w-full rounded-lg bg-muted flex items-center justify-center'>
        <p className='text-muted-foreground'>URL de video no válida</p>
      </div>
    )
  }

  // YouTube
  if (videoType.type === 'youtube' && 'id' in videoType && videoType.id) {
    return (
      <div className='aspect-video w-full'>
        <LiteYouTube videoId={videoType.id} />
      </div>
    )
  }

  // Vimeo
  if (videoType.type === 'vimeo' && 'id' in videoType && videoType.id) {
    return (
      <div className='aspect-video w-full rounded-lg overflow-hidden bg-muted'>
        <iframe
          className='w-full h-full'
          src={`https://player.vimeo.com/video/${videoType.id}`}
          title='Vimeo Video'
          frameBorder='0'
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
        />
      </div>
    )
  }

  // Video local
  if (videoType.type === 'local') {
    return (
      <div className='space-y-3'>
        <div className='aspect-video w-full rounded-lg overflow-hidden bg-black'>
          <video controls className='w-full h-full' controlsList='nodownload'>
            <source src={videoType.url} />
            <track kind='captions' />
            Tu navegador no soporta videos HTML5
          </video>
        </div>
      </div>
    )
  }

  // iframe genérico
  return (
    <div className='aspect-video w-full rounded-lg overflow-hidden bg-muted'>
      <iframe
        className='w-full h-full border-0'
        src={videoType.url}
        title='Video'
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </div>
  )
}
