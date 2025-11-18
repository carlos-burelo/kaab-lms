/**
 * Get Instructor Stats Use Case
 * Retrieves dashboard statistics for an instructor
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { prisma } from '@/lib/prisma';

interface GetInstructorStatsRequest {
  instructorId: string;
}

export interface InstructorStatsDTO {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  averageRating: number;
  totalReviews: number;
  activeStudentsThisMonth: number;
}

export class GetInstructorStatsUseCase extends BaseUseCase<
  GetInstructorStatsRequest,
  InstructorStatsDTO
> {
  async execute(request: GetInstructorStatsRequest): Promise<Result<InstructorStatsDTO>> {
    const { instructorId } = request;

    try {
      // Get all courses for the instructor
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

      const publishedCourses = courses.filter((c) => c.isPublished);
      const draftCourses = courses.filter((c) => !c.isPublished);

      // Calculate total of unique students
      const allEnrollments = await prisma.enrollment.findMany({
        where: {
          course: {
            instructorId,
          },
        },
        include: {
          user: true,
        },
      });

      const uniqueStudents = new Set(allEnrollments.map((e) => e.userId)).size;
      const totalEnrollments = allEnrollments.length;

      // Active students this month (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeThisMonth = new Set(
        allEnrollments
          .filter((e) => e.lastAccessed && e.lastAccessed > thirtyDaysAgo)
          .map((e) => e.userId)
      ).size;

      // Calculate average rating
      const totalRating = courses.reduce((acc, c) => acc + c.rating, 0);
      const totalReviewsCount = courses.reduce((acc, c) => acc + c._count.reviews, 0);
      const averageRating = courses.length > 0 ? totalRating / courses.length : 0;

      return Result.ok({
        totalCourses: courses.length,
        publishedCourses: publishedCourses.length,
        draftCourses: draftCourses.length,
        totalStudents: uniqueStudents,
        totalEnrollments,
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews: totalReviewsCount,
        activeStudentsThisMonth: activeThisMonth,
      });
    } catch (error) {
      return Result.fail(
        new Error(`Failed to get instructor stats: ${(error as Error).message}`)
      );
    }
  }
}
