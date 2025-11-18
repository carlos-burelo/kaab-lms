'use server'

import { getSession } from '@/lib/auth'
import {
  GetInstructorStatsUseCase,
  GetCourseAnalyticsUseCase,
  GetEnrollmentTrendUseCase,
  GetRevenueDataUseCase,
  InstructorStatsDTO,
  CourseAnalyticsDTO,
  EnrollmentTrendDTO,
  RevenueDataDTO,
} from '@/modules/instructor/application/use-cases'

/**
 * INSTRUCTOR DASHBOARD ACTIONS
 * Obtiene datos agregados para el dashboard del instructor
 *
 * ARQUITECTURA:
 * Client -> Server Action (validación, autorización) -> Use Case -> Repository (BD)
 */

// ============================================================================
// INITIALIZE USE CASES
// ============================================================================

const getInstructorStatsUseCase = new GetInstructorStatsUseCase()
const getCourseAnalyticsUseCase = new GetCourseAnalyticsUseCase()
const getEnrollmentTrendUseCase = new GetEnrollmentTrendUseCase()
const getRevenueDataUseCase = new GetRevenueDataUseCase()

// ============================================================================
// TYPE DEFINITIONS (Re-export from use cases)
// ============================================================================

export type InstructorStats = InstructorStatsDTO
export type CourseAnalytics = CourseAnalyticsDTO
export type EnrollmentTrend = EnrollmentTrendDTO
export type RevenueData = RevenueDataDTO

// ============================================================================
// INSTRUCTOR STATS
// ============================================================================

/**
 * Obtiene estadísticas generales del instructor
 */
export async function getInstructorStats(): Promise<{ success: boolean; data?: InstructorStats; error?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await getInstructorStatsUseCase.execute({
      instructorId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo estadísticas'
    }
  }
}

// ============================================================================
// COURSE ANALYTICS
// ============================================================================

/**
 * Obtiene análisis por curso
 */
export async function getCourseAnalytics(): Promise<{ success: boolean; data?: CourseAnalytics[]; error?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await getCourseAnalyticsUseCase.execute({
      instructorId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return { success: true, data: result.value }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo análisis'
    }
  }
}

// ============================================================================
// ENROLLMENT TRENDS
// ============================================================================

/**
 * Obtiene tendencia de inscripciones
 */
export async function getEnrollmentTrend(): Promise<{
  success: boolean
  data?: EnrollmentTrend[]
  error?: string
}> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await getEnrollmentTrendUseCase.execute({
      instructorId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return { success: true, data: result.value }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo tendencias'
    }
  }
}

// ============================================================================
// REVENUE DATA
// ============================================================================

/**
 * Obtiene datos de ingresos por curso (si tienen precio)
 */
export async function getRevenueData(): Promise<{ success: boolean; data?: RevenueData[]; error?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await getRevenueDataUseCase.execute({
      instructorId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return { success: true, data: result.value }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo ingresos'
    }
  }
}
