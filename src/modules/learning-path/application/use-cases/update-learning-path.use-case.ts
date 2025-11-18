/**
 * Update Learning Path Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import { ILearningPathRepository } from '../../domain/learning-path.repository.interface';
import { UpdateLearningPathDTO } from '../dtos';
import {
  LearningPathDTO,
  learningPathMapper,
} from '../../infrastructure/learning-path.mapper';

interface UpdateLearningPathRequest {
  id: string;
  dto: UpdateLearningPathDTO;
  currentUserId: string;
}

export class UpdateLearningPathUseCase extends BaseUseCase<
  UpdateLearningPathRequest,
  LearningPathDTO
> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super();
  }

  async execute(
    request: UpdateLearningPathRequest
  ): Promise<Result<LearningPathDTO>> {
    const { id, dto } = request;

    // Find learning path
    const learningPathResult = await this.learningPathRepository.findById(id);

    if (learningPathResult.isFailure) {
      return Result.fail(learningPathResult.error);
    }

    if (!learningPathResult.value) {
      return Result.fail(new NotFoundError('LearningPath', id));
    }

    const learningPath = learningPathResult.value;

    // Update title if provided
    if (dto.title) {
      const updateTitleResult = learningPath.updateTitle(dto.title);
      if (updateTitleResult.isFailure) {
        return Result.fail(updateTitleResult.error);
      }
    }

    // Update description if provided
    if (dto.description !== undefined) {
      learningPath.updateDescription(dto.description);
    }

    // Save changes
    const savedResult = await this.learningPathRepository.save(learningPath);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const learningPathDTO = learningPathMapper.toDTO(savedResult.value);

    return Result.ok(learningPathDTO);
  }
}
