/**
 * Delete Achievement Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import { IAchievementRepository } from '../../domain/achievement.repository.interface';

interface DeleteAchievementRequest {
  achievementId: string;
  currentUserId: string;
}

export class DeleteAchievementUseCase extends BaseUseCase<
  DeleteAchievementRequest,
  void
> {
  constructor(private achievementRepository: IAchievementRepository) {
    super();
  }

  async execute(request: DeleteAchievementRequest): Promise<Result<void>> {
    const { achievementId } = request;

    // Find achievement to ensure it exists
    const achievementResult = await this.achievementRepository.findById(
      achievementId
    );

    if (achievementResult.isFailure) {
      return Result.fail(achievementResult.error);
    }

    if (!achievementResult.value) {
      return Result.fail(new NotFoundError('Achievement', achievementId));
    }

    // Delete achievement
    const deleteResult = await this.achievementRepository.delete(achievementId);

    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error);
    }

    return Result.ok(undefined);
  }
}
