/**
 * Get Revenue Data Use Case
 * Retrieves revenue data for instructor's paid courses
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { prisma } from '@/lib/prisma';

interface GetRevenueDataRequest {
  instructorId: string;
}

export interface RevenueDataDTO {
  courseId: string;
  title: string;
  revenue: number;
  enrollments: number;
}

export class GetRevenueDataUseCase extends BaseUseCase<
  GetRevenueDataRequest,
  RevenueDataDTO[]
> {
  async execute(request: GetRevenueDataRequest): Promise<Result<RevenueDataDTO[]>> {
    const { instructorId } = request;

    try {
      const courses = await prisma.course.findMany({
        where: { instructorId },
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

      const revenueData: RevenueDataDTO[] = courses
        .filter((c) => c.price !== null && c.price !== undefined && Number(c.price) > 0)
        .map((course) => ({
          courseId: course.id,
          title: course.title,
          revenue: course.price ? Number(course.price) * course._count.enrollments : 0,
          enrollments: course._count.enrollments,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      return Result.ok(revenueData);
    } catch (error) {
      return Result.fail(
        new Error(`Failed to get revenue data: ${(error as Error).message}`)
      );
    }
  }
}
