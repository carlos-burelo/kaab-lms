/**
 * Grade Assignment Use Case
 */

import { EntityNotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'
import type { IAssignmentRepository } from '../../domain/assignment.repository.interface'
import type { GradeAssignmentDTO } from '../dtos'

interface GradeAssignmentRequest {
  dto: GradeAssignmentDTO
  currentUserId: string
}

interface GradeResponse {
  id: string
  assignmentId: string
  score: number
  feedback?: string
  gradedAt: Date
}

export class GradeAssignmentUseCase extends BaseUseCase<GradeAssignmentRequest, GradeResponse> {
  constructor(private assignmentRepository: IAssignmentRepository) {
    super()
  }

  async execute(request: GradeAssignmentRequest): Promise<Result<GradeResponse>> {
    const { dto } = request

    try {
      // Find submission
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: dto.submissionId }
      })

      if (!submission) {
        return Result.fail(new EntityNotFoundError('Submission', dto.submissionId))
      }

      // Find assignment
      const assignmentResult = await this.assignmentRepository.findById(submission.assignmentId)

      if (assignmentResult.isFailure) {
        return Result.fail(assignmentResult.error)
      }

      if (!assignmentResult.value) {
        return Result.fail(new EntityNotFoundError('Assignment', submission.assignmentId))
      }

      const assignment = assignmentResult.value

      // Validate and grade
      const gradeResult = assignment.grade(dto.submissionId, dto.score, dto.feedback)

      if (gradeResult.isFailure) {
        return Result.fail(gradeResult.error)
      }

      // Update submission in database
      const updatedSubmission = await prisma.assignmentSubmission.update({
        where: { id: dto.submissionId },
        data: {
          score: dto.score,
          feedback: dto.feedback,
          gradedAt: new Date()
        }
      })

      // Save assignment to publish domain events
      await this.assignmentRepository.save(assignment)

      return Result.ok({
        id: updatedSubmission.id,
        assignmentId: updatedSubmission.assignmentId,
        score: updatedSubmission.score!,
        feedback: updatedSubmission.feedback || undefined,
        gradedAt: updatedSubmission.gradedAt!
      })
    } catch (error) {
      return Result.fail(new Error(`Failed to grade assignment: ${(error as Error).message}`))
    }
  }
}
