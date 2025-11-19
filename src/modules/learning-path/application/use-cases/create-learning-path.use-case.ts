/**
 * Create Learning Path Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { LearningPath } from '../../domain/learning-path.entity';
import type { ILearningPathRepository } from '../../domain/learning-path.repository.interface';
import type { CreateLearningPathDTO } from '../dtos';
import {
  type LearningPathDTO,
  learningPathMapper,
} from '../../infrastructure/learning-path.mapper';

interface CreateLearningPathRequest {
  dto: CreateLearningPathDTO;
  currentUserId: string;
}

export class CreateLearningPathUseCase extends BaseUseCase<
  CreateLearningPathRequest,
  LearningPathDTO
> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super();
  }

  async execute(
    request: CreateLearningPathRequest
  ): Promise<Result<LearningPathDTO>> {
    const { dto } = request;

    // Create learning path entity
    const learningPathResult = LearningPath.create({
      title: dto.title,
      description: dto.description,
      createdBy: dto.createdBy,
    });

    if (learningPathResult.isFailure) {
      return Result.fail(learningPathResult.error);
    }

    // Save to repository
    const savedResult = await this.learningPathRepository.save(
      learningPathResult.value
    );

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const learningPathDTO = learningPathMapper.toDTO(savedResult.value);

    return Result.ok(learningPathDTO);
  }
}
