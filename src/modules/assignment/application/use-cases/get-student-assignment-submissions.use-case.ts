/**
 * Get Student Assignment Submissions Use Case
 * Retrieves all assignment submissions for a student in a specific course
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { prisma } from '@/lib/prisma';

interface GetStudentAssignmentSubmissionsRequest {
  courseId: string;
  currentUserId: string;
}

interface StudentSubmissionDTO {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  lessonTitle: string;
  moduleTitle: string;
  content?: string;
  fileId?: string;
  fileName?: string;
  score?: number;
  maxScore: number;
  feedback?: string;
  status: string;
  submittedAt: Date;
  gradedAt?: Date;
  dueDate: Date;
  isLate: boolean;
}

interface StudentAssignmentSubmissionsResponse {
  courseId: string;
  courseTitle: string;
  submissions: StudentSubmissionDTO[];
  totalSubmissions: number;
  gradedCount: number;
  pendingCount: number;
  averageScore: number;
}

export class GetStudentAssignmentSubmissionsUseCase extends BaseUseCase<
  GetStudentAssignmentSubmissionsRequest,
  StudentAssignmentSubmissionsResponse
> {
  async execute(request: GetStudentAssignmentSubmissionsRequest): Promise<Result<StudentAssignmentSubmissionsResponse>> {
    const { courseId, currentUserId } = request;

    try {
      // Get course info
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true },
      });

      if (!course) {
        return Result.fail(new Error('Course not found'));
      }

      // Get all student's submissions for assignments in this course
      const submissions = await prisma.assignmentSubmission.findMany({
        where: {
          userId: currentUserId,
          assignment: {
            lesson: {
              module: {
                courseId,
              },
            },
          },
        },
        include: {
          assignment: {
            include: {
              lesson: {
                include: {
                  module: true,
                },
              },
            },
          },
          files: true,
        },
        orderBy: { submittedAt: 'desc' },
      });

      // Map to DTOs
      const submissionDTOs: StudentSubmissionDTO[] = submissions.map((sub) => {
        const isLate = sub.submittedAt > sub.assignment.dueDate;

        return {
          id: sub.id,
          assignmentId: sub.assignmentId,
          assignmentTitle: sub.assignment.title,
          lessonTitle: sub.assignment.lesson.title,
          moduleTitle: sub.assignment.lesson.module.title,
          content: sub.content || undefined,
          fileId: sub.fileId || undefined,
          fileName: sub.files && sub.files.length > 0 ? sub.files[0].name : undefined,
          score: sub.score || undefined,
          maxScore: sub.assignment.maxScore,
          feedback: sub.feedback || undefined,
          status: sub.status,
          submittedAt: sub.submittedAt,
          gradedAt: sub.gradedAt || undefined,
          dueDate: sub.assignment.dueDate,
          isLate,
        };
      });

      // Calculate statistics
      const gradedSubmissions = submissions.filter((s) => s.status === 'GRADED');
      const pendingSubmissions = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'IN_REVIEW');
      const averageScore =
        gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
          : 0;

      return Result.ok({
        courseId: course.id,
        courseTitle: course.title,
        submissions: submissionDTOs,
        totalSubmissions: submissions.length,
        gradedCount: gradedSubmissions.length,
        pendingCount: pendingSubmissions.length,
        averageScore: Math.round(averageScore * 100) / 100,
      });
    } catch (error) {
      return Result.fail(
        new Error(`Failed to get student assignment submissions: ${(error as Error).message}`)
      );
    }
  }
}
