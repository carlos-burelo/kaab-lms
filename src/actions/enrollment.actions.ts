'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { enrollmentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

/**
 * Enrollment Actions
 * Server actions para operaciones de inscripciones
 */

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const GetEnrollmentsSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  limit: z.number().min(1).max(200).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'progress', 'lastAccessed', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['all', 'active', 'completed', 'inactive']).default('all'),
  search: z.string().optional(),
  minProgress: z.number().optional(),
  maxProgress: z.number().optional()
})

const UpdateEnrollmentSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  progress: z.number().min(0).max(100).optional(),
  totalTimeMinutes: z.number().min(0).optional(),
  isCompleted: z.boolean().optional()
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
// ENROLLMENT OPERATIONS
// ============================================================================

/**
 * Get enrollments for a course
 */
export async function getEnrollments(params: z.infer<typeof GetEnrollmentsSchema>): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const parsed = GetEnrollmentsSchema.safeParse(params)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    // Verify instructor owns the course
    // This should be done in a real app with proper authorization

    const result = await enrollmentRepository.getEnrollmentsByCourse(parsed.data.courseId, {
      filters: {
        status: parsed.data.status,
        search: parsed.data.search,
        minProgress: parsed.data.minProgress,
        maxProgress: parsed.data.maxProgress
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
      error: error instanceof Error ? error.message : 'Error getting enrollments'
    }
  }
}

/**
 * Get enrollment by ID
 */
export async function getEnrollmentById(enrollmentId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const enrollment = await enrollmentRepository.getEnrollmentById(enrollmentId)
    if (!enrollment) {
      return {
        success: false,
        error: 'Enrollment not found'
      }
    }

    return {
      success: true,
      data: enrollment
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting enrollment'
    }
  }
}

/**
 * Update enrollment
 */
export async function updateEnrollment(params: z.infer<typeof UpdateEnrollmentSchema>): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const parsed = UpdateEnrollmentSchema.safeParse(params)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    const enrollment = await enrollmentRepository.updateEnrollment(parsed.data.enrollmentId, parsed.data)

    revalidatePath('/instructor/enrollments')

    return {
      success: true,
      data: enrollment
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error updating enrollment'
    }
  }
}

/**
 * Complete enrollment
 */
export async function completeEnrollment(enrollmentId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const enrollment = await enrollmentRepository.completeEnrollment(enrollmentId)

    revalidatePath('/instructor/enrollments')

    return {
      success: true,
      data: enrollment
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error completing enrollment'
    }
  }
}

/**
 * Get course enrollment statistics
 */
export async function getCourseEnrollmentStats(courseId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const stats = await enrollmentRepository.getCourseEnrollmentStats(courseId)

    return {
      success: true,
      data: stats
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting statistics'
    }
  }
}

/**
 * Get top performers
 */
export async function getTopPerformers(courseId: string, limit: number = 10): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const performers = await enrollmentRepository.getTopPerformers(courseId, limit)

    return {
      success: true,
      data: performers
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting top performers'
    }
  }
}

/**
 * Get at-risk students
 */
export async function getAtRiskStudents(courseId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const students = await enrollmentRepository.getAtRiskStudents(courseId)

    return {
      success: true,
      data: students
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting at-risk students'
    }
  }
}

/**
 * Get recent enrollments
 */
export async function getRecentEnrollments(courseId: string, days: number = 7): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const enrollments = await enrollmentRepository.getRecentEnrollments(courseId, days)

    return {
      success: true,
      data: enrollments
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting recent enrollments'
    }
  }
}

/**
 * Search enrollments
 */
export async function searchEnrollments(courseId: string, query: string): Promise<ActionResponse> {
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

    const results = await enrollmentRepository.searchEnrollments(courseId, query)

    return {
      success: true,
      data: results
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error searching enrollments'
    }
  }
}

/**
 * Get enrollment status counts
 */
export async function getEnrollmentStatusCounts(courseId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const counts = await enrollmentRepository.countByStatus(courseId)

    return {
      success: true,
      data: counts
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting status counts'
    }
  }
}

/**
 * Get average completion time
 */
export async function getAverageCompletionTime(courseId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const days = await enrollmentRepository.getAverageCompletionTime(courseId)

    return {
      success: true,
      data: { days }
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting completion time'
    }
  }
}

/**
 * Bulk update enrollments
 */
export async function bulkUpdateEnrollments(enrollmentIds: string[], progress?: number): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    if (!enrollmentIds || enrollmentIds.length === 0) {
      return {
        success: false,
        error: 'No enrollments selected'
      }
    }

    const data: any = {}
    if (progress !== undefined) {
      data.progress = Math.min(100, Math.max(0, progress))
    }

    await enrollmentRepository.bulkUpdateEnrollments(enrollmentIds, data)

    revalidatePath('/instructor/enrollments')

    return {
      success: true,
      data: { updatedCount: enrollmentIds.length }
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error updating enrollments'
    }
  }
}
