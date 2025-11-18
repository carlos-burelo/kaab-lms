/**
 * Unlock Achievement Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, DuplicateEntityError } from '@/core/shared/errors';
import { IAchievementRepository } from '../../domain/achievement.repository.interface';
import { IUserGamificationRepository } from '../../domain/user-gamification.repository.interface';
import { UnlockAchievementDTO } from '../dtos';

interface UnlockAchievementRequest {
  dto: UnlockAchievementDTO;
  currentUserId: string;
}

export class UnlockAchievementUseCase extends BaseUseCase<
  UnlockAchievementRequest,
  void
> {
  constructor(
    private achievementRepository: IAchievementRepository,
    private userGamificationRepository: IUserGamificationRepository
  ) {
    super();
  }

  async execute(request: UnlockAchievementRequest): Promise<Result<void>> {
    const { dto } = request;

    // Find achievement
    const achievementResult = await this.achievementRepository.findById(
      dto.achievementId
    );

    if (achievementResult.isFailure) {
      return Result.fail(achievementResult.error);
    }

    if (!achievementResult.value) {
      return Result.fail(new NotFoundError('Achievement', dto.achievementId));
    }

    const achievement = achievementResult.value;

    // Check if user already has achievement
    const hasAchievementResult =
      await this.achievementRepository.userHasAchievement(
        dto.userId,
        dto.achievementId
      );

    if (hasAchievementResult.isFailure) {
      return Result.fail(hasAchievementResult.error);
    }

    if (hasAchievementResult.value) {
      return Result.fail(
        new DuplicateEntityError(
          'User already has this achievement',
          'achievementId',
          dto.achievementId
        )
      );
    }

    // Unlock achievement
    const unlockResult = achievement.unlock(dto.userId);

    if (unlockResult.isFailure) {
      return Result.fail(unlockResult.error);
    }

    // Unlock achievement for user
    const unlockForUserResult =
      await this.achievementRepository.unlockAchievementForUser(
        dto.userId,
        dto.achievementId
      );

    if (unlockForUserResult.isFailure) {
      return Result.fail(unlockForUserResult.error);
    }

    // Get or create user gamification profile
    const userGamificationResult =
      await this.userGamificationRepository.getOrCreate(dto.userId);

    if (userGamificationResult.isFailure) {
      return Result.fail(userGamificationResult.error);
    }

    const userGamification = userGamificationResult.value;

    // Add XP reward
    if (achievement.xpReward > 0) {
      const addXpResult = userGamification.addXp(
        achievement.xpReward,
        `Achievement unlocked: ${achievement.name}`
      );

      if (addXpResult.isFailure) {
        return Result.fail(addXpResult.error);
      }
    }

    // Add coin reward
    if (achievement.coinReward > 0) {
      const addCoinsResult = userGamification.addCoins(
        achievement.coinReward,
        `Achievement unlocked: ${achievement.name}`
      );

      if (addCoinsResult.isFailure) {
        return Result.fail(addCoinsResult.error);
      }
    }

    // Save user gamification
    const saveResult = await this.userGamificationRepository.save(
      userGamification
    );

    if (saveResult.isFailure) {
      return Result.fail(saveResult.error);
    }

    return Result.ok(undefined);
  }
}
