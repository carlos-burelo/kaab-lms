/**
 * Create Assignment Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { Assignment } from '../../domain/assignment.entity';
import { IAssignmentRepository } from '../../domain/assignment.repository.interface';
import { CreateAssignmentDTO } from '../dtos';
import { AssignmentDTO, assignmentMapper } from '../../infrastructure/assignment.mapper';

interface CreateAssignmentRequest {
  dto: CreateAssignmentDTO;
  currentUserId: string;
}

export class CreateAssignmentUseCase extends BaseUseCase<
  CreateAssignmentRequest,
  AssignmentDTO
> {
  constructor(private assignmentRepository: IAssignmentRepository) {
    super();
  }

  async execute(request: CreateAssignmentRequest): Promise<Result<AssignmentDTO>> {
    const { dto } = request;

    // Create assignment entity
    const assignmentResult = Assignment.create({
      title: dto.title,
      description: dto.description,
      lessonId: dto.lessonId,
      dueDate: dto.dueDate,
      maxScore: dto.maxScore,
    });

    if (assignmentResult.isFailure) {
      return Result.fail(assignmentResult.error);
    }

    // Save to repository
    const savedResult = await this.assignmentRepository.save(assignmentResult.value);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const assignmentDTO = assignmentMapper.toDTO(savedResult.value);

    return Result.ok(assignmentDTO);
  }
}
