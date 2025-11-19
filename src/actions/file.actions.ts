'use server'

import { error } from 'console'
import { revalidatePath } from 'next/cache'
import z from 'zod'
import { fileRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

/**
 * File Actions
 * Server actions para operaciones de archivos/assets
 */

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const GetUploadedFilesSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'name', 'sizeInBytes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  type: z.string().optional(),
  folder: z.string().optional(),
  search: z.string().optional()
})

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Get all uploaded files for instructor
 */
export async function getUploadedFiles(params: z.infer<typeof GetUploadedFilesSchema>): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const parsed = GetUploadedFilesSchema.safeParse(params)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    const result = await fileRepository.getUploadedFiles({
      filters: {
        userId: session.id,
        type: parsed.data.type,
        folder: parsed.data.folder,
        search: parsed.data.search
      },
      limit: parsed.data.limit,
      offset: parsed.data.offset,
      sortBy: parsed.data.sortBy,
      sortOrder: parsed.data.sortOrder
    })

    return {
      success: true,
      data: result
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error getting files'
    }
  }
}

/**
 * Get file by ID
 */
export async function getFileById(fileId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const file = await fileRepository.getFileById(fileId)
    if (!file) {
      return {
        success: false,
        error: 'File not found'
      }
    }

    // Only allow access to own files
    if (file.userId !== session.id) {
      return {
        success: false,
        error: 'Access denied'
      }
    }

    return {
      success: true,
      data: file
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error getting file'
    }
  }
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const file = await fileRepository.getFileById(fileId)
    if (!file) {
      return {
        success: false,
        error: 'File not found'
      }
    }

    // Only allow deletion of own files
    if (file.userId !== session.id) {
      return {
        success: false,
        error: 'Access denied'
      }
    }

    await fileRepository.deleteFile(fileId)

    revalidatePath('/instructor/assets')

    return {
      success: true,
      data: { id: fileId }
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error deleting file'
    }
  }
}

/**
 * Toggle file public/private
 */
export async function toggleFilePublic(fileId: string, isPublic: boolean): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const file = await fileRepository.getFileById(fileId)
    if (!file) {
      return {
        success: false,
        error: 'File not found'
      }
    }

    // Only allow toggling own files
    if (file.userId !== session.id) {
      return {
        success: false,
        error: 'Access denied'
      }
    }

    const updated = await fileRepository.toggleFilePublic(fileId, isPublic)

    revalidatePath('/instructor/assets')

    return {
      success: true,
      data: updated
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error updating file'
    }
  }
}

/**
 * Get user file statistics
 */
export async function getUserFileStats(): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const stats = await fileRepository.getUserFileStats(session.id)

    return {
      success: true,
      data: stats
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error getting statistics'
    }
  }
}

/**
 * Get available file types
 */
export async function getAvailableFileTypes(): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const types = await fileRepository.getAvailableFileTypes(session.id)

    return {
      success: true,
      data: types
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error getting file types'
    }
  }
}

/**
 * Search files
 */
export async function searchFiles(query: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    if (!query || query.trim().length < 2) {
      return {
        success: false,
        error: 'Search query must be at least 2 characters'
      }
    }

    const results = await fileRepository.searchFiles(query, session.id, 50)

    return {
      success: true,
      data: results
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error searching files'
    }
  }
}
