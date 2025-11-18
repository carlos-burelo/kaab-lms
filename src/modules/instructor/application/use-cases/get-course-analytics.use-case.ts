/**
 * Get Course Analytics Use Case
 * Retrieves analytics data for all instructor's courses
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { prisma } from '@/lib/prisma';

interface GetCourseAnalyticsRequest {
  instructorId: string;
}

export interface CourseAnalyticsDTO {
  courseId: string;
  title: string;
  enrollments: number;
  rating: number;
  totalReviews: number;
}

export class GetCourseAnalyticsUseCase extends BaseUseCase<
  GetCourseAnalyticsRequest,
  CourseAnalyticsDTO[]
> {
  async execute(request: GetCourseAnalyticsRequest): Promise<Result<CourseAnalyticsDTO[]>> {
    const { instructorId } = request;

    try {
      const courses = await prisma.course.findMany({
        where: { instructorId },
        include: {
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
      });

      const analytics: CourseAnalyticsDTO[] = courses
        .filter((c) => c.isPublished)
        .map((course) => ({
          courseId: course.id,
          title: course.title,
          enrollments: course._count.enrollments,
          rating: course.rating,
          totalReviews: course._count.reviews,
        }))
        .sort((a, b) => b.enrollments - a.enrollments);

      return Result.ok(analytics);
    } catch (error) {
      return Result.fail(
        new Error(`Failed to get course analytics: ${(error as Error).message}`)
      );
    }
  }
}
