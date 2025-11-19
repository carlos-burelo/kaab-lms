/**
 * Get User Progress Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import type { ILearningPathRepository } from '../../domain/learning-path.repository.interface';
import {
  type UserLearningPathProgressDTO,
  userLearningPathProgressMapper,
} from '../../infrastructure/learning-path.mapper';

interface GetUserProgressRequest {
  learningPathId: string;
  userId: string;
}

export class GetUserProgressUseCase extends BaseUseCase<
  GetUserProgressRequest,
  UserLearningPathProgressDTO
> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super();
  }

  async execute(
    request: GetUserProgressRequest
  ): Promise<Result<UserLearningPathProgressDTO>> {
    const { learningPathId, userId } = request;

    // Get user progress
    const progressResult = await this.learningPathRepository.getUserProgress(
      userId,
      learningPathId
    );

    if (progressResult.isFailure) {
      return Result.fail(progressResult.error);
    }

    if (!progressResult.value) {
      return Result.fail(
        new NotFoundError('UserProgress', `${userId}-${learningPathId}`)
      );
    }

    // Map to DTO
    const progressDTO = userLearningPathProgressMapper.toDTO(
      progressResult.value
    );

    return Result.ok(progressDTO);
  }
}
