/**
 * Get Enrollment Trend Use Case
 * Retrieves enrollment trends for the last 30 days
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface GetEnrollmentTrendRequest {
  instructorId: string
}

export interface EnrollmentTrendDTO {
  date: string
  enrollments: number
  cumulative: number
}

export class GetEnrollmentTrendUseCase extends BaseUseCase<GetEnrollmentTrendRequest, EnrollmentTrendDTO[]> {
  async execute(request: GetEnrollmentTrendRequest): Promise<Result<EnrollmentTrendDTO[]>> {
    const { instructorId } = request

    try {
      // Get enrollments from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const enrollments = await prisma.enrollment.findMany({
        where: {
          course: {
            instructorId
          },
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Group by date
      const trendMap = new Map<string, number>()
      let cumulative = 0

      enrollments.forEach((enrollment) => {
        const dateKey = enrollment.createdAt.toISOString().split('T')[0]
        trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1)
      })

      // Generate data for all days (fill gaps with zeros)
      const trend: EnrollmentTrendDTO[] = []
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

      return Result.ok(trend)
    } catch (error) {
      return Result.fail(new Error(`Failed to get enrollment trend: ${(error as Error).message}`))
    }
  }
}
