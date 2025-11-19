/**
 * Submit Assignment Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { EntityNotFoundError } from '@/core/shared/errors';
import type { IAssignmentRepository } from '../../domain/assignment.repository.interface';
import type { SubmitAssignmentDTO } from '../dtos';
import { prisma } from '@/lib/prisma';

interface SubmitAssignmentRequest {
  dto: SubmitAssignmentDTO;
  currentUserId: string;
}

interface SubmissionResponse {
  id: string;
  assignmentId: string;
  userId: string;
  content?: string;
  fileId?: string;
  submittedAt: Date;
}

export class SubmitAssignmentUseCase extends BaseUseCase<
  SubmitAssignmentRequest,
  SubmissionResponse
> {
  constructor(private assignmentRepository: IAssignmentRepository) {
    super();
  }

  async execute(request: SubmitAssignmentRequest): Promise<Result<SubmissionResponse>> {
    const { dto, currentUserId } = request;

    // Find assignment
    const assignmentResult = await this.assignmentRepository.findById(dto.assignmentId);

    if (assignmentResult.isFailure) {
      return Result.fail(assignmentResult.error);
    }

    if (!assignmentResult.value) {
      return Result.fail(new EntityNotFoundError('Assignment', dto.assignmentId));
    }

    const assignment = assignmentResult.value;

    // Validate submission
    const submitResult = assignment.submit(currentUserId, dto.content, dto.fileId);

    if (submitResult.isFailure) {
      return Result.fail(submitResult.error);
    }

    // Save submission to database
    try {
      const submission = await prisma.assignmentSubmission.create({
        data: {
          assignmentId: dto.assignmentId,
          userId: currentUserId,
          content: dto.content,
          fileId: dto.fileId,
        },
      });

      // Save assignment to publish domain events
      await this.assignmentRepository.save(assignment);

      return Result.ok({
        id: submission.id,
        assignmentId: submission.assignmentId,
        userId: submission.userId,
        content: submission.content || undefined,
        fileId: submission.fileId || undefined,
        submittedAt: submission.submittedAt,
      });
    } catch (error) {
      return Result.fail(
        new Error(`Failed to submit assignment: ${(error as Error).message}`)
      );
    }
  }
}
