/**
 * Get User Achievements Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import type { IAchievementRepository } from '../../domain/achievement.repository.interface';
import {
  type AchievementDTO,
  achievementMapper,
} from '../../infrastructure/achievement.mapper';

interface GetUserAchievementsRequest {
  userId: string;
  currentUserId: string;
}

interface UserAchievementDTO {
  achievement: AchievementDTO;
  progress: number;
  progressPercentage: number;
  unlockedAt?: Date;
}

export class GetUserAchievementsUseCase extends BaseUseCase<
  GetUserAchievementsRequest,
  UserAchievementDTO[]
> {
  constructor(private achievementRepository: IAchievementRepository) {
    super();
  }

  async execute(
    request: GetUserAchievementsRequest
  ): Promise<Result<UserAchievementDTO[]>> {
    const { userId } = request;

    // Get user achievements
    const achievementsResult =
      await this.achievementRepository.getUserAchievements(userId);

    if (achievementsResult.isFailure) {
      return Result.fail(achievementsResult.error);
    }

    // Map to DTOs
    const achievementDTOs = achievementsResult.value.map((item) => ({
      achievement: achievementMapper.toDTO(item.achievement),
      progress: item.progress,
      progressPercentage: item.achievement.calculateProgressPercentage(
        item.progress
      ),
      unlockedAt: item.unlockedAt,
    }));

    return Result.ok(achievementDTOs);
  }
}
