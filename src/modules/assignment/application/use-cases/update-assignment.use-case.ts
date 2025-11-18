/**
 * Update Assignment Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { EntityNotFoundError } from '@/core/shared/errors';
import { IAssignmentRepository } from '../../domain/assignment.repository.interface';
import { UpdateAssignmentDTO } from '../dtos';
import { AssignmentDTO, assignmentMapper } from '../../infrastructure/assignment.mapper';

interface UpdateAssignmentRequest {
  dto: UpdateAssignmentDTO;
  currentUserId: string;
}

export class UpdateAssignmentUseCase extends BaseUseCase<
  UpdateAssignmentRequest,
  AssignmentDTO
> {
  constructor(private assignmentRepository: IAssignmentRepository) {
    super();
  }

  async execute(request: UpdateAssignmentRequest): Promise<Result<AssignmentDTO>> {
    const { dto } = request;

    // Find assignment
    const assignmentResult = await this.assignmentRepository.findById(dto.id);

    if (assignmentResult.isFailure) {
      return Result.fail(assignmentResult.error);
    }

    if (!assignmentResult.value) {
      return Result.fail(new EntityNotFoundError('Assignment', dto.id));
    }

    const assignment = assignmentResult.value;

    // Update assignment properties
    if (dto.title) {
      const titleResult = assignment.updateTitle(dto.title);
      if (titleResult.isFailure) {
        return Result.fail(titleResult.error);
      }
    }

    if (dto.description !== undefined) {
      assignment.updateDescription(dto.description);
    }

    if (dto.dueDate !== undefined) {
      const dueDateResult = assignment.updateDueDate(dto.dueDate);
      if (dueDateResult.isFailure) {
        return Result.fail(dueDateResult.error);
      }
    }

    if (dto.maxScore !== undefined) {
      const maxScoreResult = assignment.updateMaxScore(dto.maxScore);
      if (maxScoreResult.isFailure) {
        return Result.fail(maxScoreResult.error);
      }
    }

    // Save to repository
    const savedResult = await this.assignmentRepository.save(assignment);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const assignmentDTO = assignmentMapper.toDTO(savedResult.value);

    return Result.ok(assignmentDTO);
  }
}
