/**
 * Get Assignment Use Case
 */

import { EntityNotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IAssignmentRepository } from '../../domain/assignment.repository.interface'
import { type AssignmentDTO, assignmentMapper } from '../../infrastructure/assignment.mapper'

interface GetAssignmentRequest {
  assignmentId: string
  currentUserId: string
}

export class GetAssignmentUseCase extends BaseUseCase<GetAssignmentRequest, AssignmentDTO> {
  constructor(private assignmentRepository: IAssignmentRepository) {
    super()
  }

  async execute(request: GetAssignmentRequest): Promise<Result<AssignmentDTO>> {
    const { assignmentId } = request

    // Find assignment
    const assignmentResult = await this.assignmentRepository.findByIdWithSubmissions(assignmentId)

    if (assignmentResult.isFailure) {
      return Result.fail(assignmentResult.error)
    }

    if (!assignmentResult.value) {
      return Result.fail(new EntityNotFoundError('Assignment', assignmentId))
    }

    // Map to DTO
    const assignmentDTO = assignmentMapper.toDTO(assignmentResult.value)

    return Result.ok(assignmentDTO)
  }
}
