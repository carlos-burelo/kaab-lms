/**
 * Get Assignment Submissions Use Case
 * Retrieves all submissions for a specific assignment (instructor only)
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { EntityNotFoundError } from '@/core/shared/errors';
import { IAssignmentRepository } from '../../domain/assignment.repository.interface';
import { prisma } from '@/lib/prisma';

interface GetAssignmentSubmissionsRequest {
  assignmentId: string;
  currentUserId: string;
}

interface SubmissionDTO {
  id: string;
  assignmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  content?: string;
  fileId?: string;
  fileName?: string;
  score?: number;
  feedback?: string;
  status: string;
  submittedAt: Date;
  gradedAt?: Date;
}

interface AssignmentSubmissionsResponse {
  assignmentId: string;
  assignmentTitle: string;
  maxScore: number;
  submissions: SubmissionDTO[];
  totalSubmissions: number;
  gradedCount: number;
  pendingCount: number;
  averageScore: number;
}

export class GetAssignmentSubmissionsUseCase extends BaseUseCase<
  GetAssignmentSubmissionsRequest,
  AssignmentSubmissionsResponse
> {
  constructor(private assignmentRepository: IAssignmentRepository) {
    super();
  }

  async execute(request: GetAssignmentSubmissionsRequest): Promise<Result<AssignmentSubmissionsResponse>> {
    const { assignmentId } = request;

    // Verify assignment exists
    const assignmentResult = await this.assignmentRepository.findById(assignmentId);

    if (assignmentResult.isFailure) {
      return Result.fail(assignmentResult.error);
    }

    if (!assignmentResult.value) {
      return Result.fail(new EntityNotFoundError('Assignment', assignmentId));
    }

    const assignment = assignmentResult.value;

    try {
      // Get all submissions for this assignment
      const submissions = await prisma.assignmentSubmission.findMany({
        where: { assignmentId },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          files: true,
        },
        orderBy: { submittedAt: 'desc' },
      });

      // Map to DTOs
      const submissionDTOs: SubmissionDTO[] = submissions.map((sub) => ({
        id: sub.id,
        assignmentId: sub.assignmentId,
        userId: sub.userId,
        userName: sub.user.profile?.fullName || sub.user.name || 'Unknown',
        userEmail: sub.user.email,
        userAvatar: sub.user.profile?.avatar || undefined,
        content: sub.content || undefined,
        fileId: sub.fileId || undefined,
        fileName: sub.files && sub.files.length > 0 ? sub.files[0].name : undefined,
        score: sub.score || undefined,
        feedback: sub.feedback || undefined,
        status: sub.status,
        submittedAt: sub.submittedAt,
        gradedAt: sub.gradedAt || undefined,
      }));

      // Calculate statistics
      const gradedSubmissions = submissions.filter((s) => s.status === 'GRADED');
      const pendingSubmissions = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'IN_REVIEW');
      const averageScore =
        gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
          : 0;

      return Result.ok({
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        maxScore: assignment.maxScore,
        submissions: submissionDTOs,
        totalSubmissions: submissions.length,
        gradedCount: gradedSubmissions.length,
        pendingCount: pendingSubmissions.length,
        averageScore: Math.round(averageScore * 100) / 100,
      });
    } catch (error) {
      return Result.fail(
        new Error(`Failed to get assignment submissions: ${(error as Error).message}`)
      );
    }
  }
}
