'use client'

import { useCallback, useTransition } from 'react'
import { updateLessonContent } from '@/actions/courseActions'

interface UseContentEditorProps {
  contentId: string
  onUpdate: (contentId: string, data: Record<string, unknown>) => void
}

interface ContentEditorState {
  isSaving: boolean
  error: string | null
  success: boolean
}

export function useContentEditor({ contentId, onUpdate }: UseContentEditorProps) {
  const [isPending, startTransition] = useTransition()

  const saveContent = useCallback(
    async (data: { titulo?: string; contenido?: string }) => {
      // Validar que tenemos datos para guardar
      if (!contentId) {
        return {
          success: false,
          error: 'ID de contenido no válido'
        }
      }

      // Validar titulo
      if (data.titulo !== undefined && typeof data.titulo !== 'string') {
        return {
          success: false,
          error: 'El título debe ser texto'
        }
      }

      // Validar contenido
      if (data.contenido !== undefined && typeof data.contenido !== 'string') {
        return {
          success: false,
          error: 'El contenido debe ser texto'
        }
      }

      // Validar longitudes
      if (data.titulo && data.titulo.length > 255) {
        return {
          success: false,
          error: 'El título no puede exceder 255 caracteres'
        }
      }

      if (data.contenido && data.contenido.length > 100000) {
        return {
          success: false,
          error: 'El contenido no puede exceder 100,000 caracteres'
        }
      }

      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        startTransition(async () => {
          try {
            await updateLessonContent(contentId, {
              titulo: data.titulo || undefined,
              contenido: data.contenido || undefined
            })

            onUpdate(contentId, data)
            resolve({ success: true })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al guardar el contenido'
            resolve({
              success: false,
              error: errorMessage
            })
          }
        })
      })
    },
    [contentId, onUpdate]
  )

  return {
    isPending,
    saveContent
  }
}
