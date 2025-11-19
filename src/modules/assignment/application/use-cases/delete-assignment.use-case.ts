/**
 * Delete Assignment Use Case
 */

import { EntityNotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IAssignmentRepository } from '../../domain/assignment.repository.interface'

interface DeleteAssignmentRequest {
  assignmentId: string
  currentUserId: string
}

export class DeleteAssignmentUseCase extends BaseUseCase<DeleteAssignmentRequest, void> {
  constructor(private assignmentRepository: IAssignmentRepository) {
    super()
  }

  async execute(request: DeleteAssignmentRequest): Promise<Result<void>> {
    const { assignmentId } = request

    // Check if assignment exists
    const existsResult = await this.assignmentRepository.exists(assignmentId)

    if (existsResult.isFailure) {
      return Result.fail(existsResult.error)
    }

    if (!existsResult.value) {
      return Result.fail(new EntityNotFoundError('Assignment', assignmentId))
    }

    // Delete assignment
    const deleteResult = await this.assignmentRepository.delete(assignmentId)

    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error)
    }

    return Result.ok(undefined)
  }
}
