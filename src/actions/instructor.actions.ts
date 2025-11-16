'use server'

import { courseRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * INSTRUCTOR DASHBOARD ACTIONS
 * Obtiene datos agregados para el dashboard del instructor
 */

export interface InstructorStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalStudents: number
  totalEnrollments: number
  averageRating: number
  totalReviews: number
  activeStudentsThisMonth: number
}

export interface CourseAnalytics {
  courseId: string
  title: string
  enrollments: number
  rating: number
  totalReviews: number
}

export interface EnrollmentTrend {
  date: string
  enrollments: number
  cumulative: number
}

export interface RevenueData {
  courseId: string
  title: string
  revenue: number
  enrollments: number
}

/**
 * Obtiene estadísticas generales del instructor
 */
export async function getInstructorStats(): Promise<{ success: boolean; data?: InstructorStats; error?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const courses = await courseRepository.getInstructorCourses(session.id)

    if (!courses) {
      return {
        success: true,
        data: {
          totalCourses: 0,
          publishedCourses: 0,
          draftCourses: 0,
          totalStudents: 0,
          totalEnrollments: 0,
          averageRating: 0,
          totalReviews: 0,
          activeStudentsThisMonth: 0
        }
      }
    }

    const publishedCourses = courses.filter((c) => c.isPublished)
    const draftCourses = courses.filter((c) => !c.isPublished)

    // Calcular total de estudiantes únicos
    const allEnrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: session.id
        }
      },
      include: {
        user: true
      }
    })

    const uniqueStudents = new Set(allEnrollments.map((e) => e.userId)).size
    const totalEnrollments = allEnrollments.length

    // Estudiantes activos este mes
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeThisMonth = new Set(
      allEnrollments.filter((e) => e.lastAccessed && e.lastAccessed > thirtyDaysAgo).map((e) => e.userId)
    ).size

    // Calcular promedio de rating
    const totalRating = courses.reduce((acc, c) => acc + c.rating, 0)
    const totalReviewsCount = courses.reduce((acc, c) => acc + c.totalReviews, 0)
    const averageRating = courses.length > 0 ? totalRating / courses.length : 0

    return {
      success: true,
      data: {
        totalCourses: courses.length,
        publishedCourses: publishedCourses.length,
        draftCourses: draftCourses.length,
        totalStudents: uniqueStudents,
        totalEnrollments,
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews: totalReviewsCount,
        activeStudentsThisMonth: activeThisMonth
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo estadísticas'
    }
  }
}

/**
 * Obtiene análisis por curso
 */
export async function getCourseAnalytics(): Promise<{ success: boolean; data?: CourseAnalytics[]; error?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const courses = await courseRepository.getInstructorCourses(session.id)

    if (!courses) {
      return { success: true, data: [] }
    }

    const analytics: CourseAnalytics[] = courses
      .filter((c) => c.isPublished)
      .map((course) => ({
        courseId: course.id,
        title: course.title,
        enrollments: course._count?.enrollments || 0,
        rating: course.rating,
        totalReviews: course.totalReviews
      }))
      .sort((a, b) => b.enrollments - a.enrollments)

    return { success: true, data: analytics }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo análisis'
    }
  }
}

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

    // Obtener inscripciones de los últimos 30 días
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: session.id
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Agrupar por fecha
    const trendMap = new Map<string, number>()
    let cumulative = 0

    enrollments.forEach((enrollment) => {
      const dateKey = enrollment.createdAt.toISOString().split('T')[0]
      trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1)
    })

    // Generar datos para todos los días (llenar vacíos)
    const trend: EnrollmentTrend[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const count = trendMap.get(dateKey) || 0
      cumulative += count

      trend.push({
        date: dateKey,
        enrollments: count,
        cumulative
      })
    }

    return { success: true, data: trend }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo tendencias'
    }
  }
}

/**
 * Obtiene datos de ingresos por curso (si tienen precio)
 */
export async function getRevenueData(): Promise<{ success: boolean; data?: RevenueData[]; error?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const courses = await courseRepository.getInstructorCourses(session.id)

    if (!courses) {
      return { success: true, data: [] }
    }

    const revenueData: RevenueData[] = courses
      .filter((c) => c.price !== null && c.price !== undefined && Number(c.price) > 0)
      .map((course) => ({
        courseId: course.id,
        title: course.title,
        revenue: course.price ? Number(course.price) * (course._count?.enrollments || 0) : 0,
        enrollments: course._count?.enrollments || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)

    return { success: true, data: revenueData }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo ingresos'
    }
  }
}
