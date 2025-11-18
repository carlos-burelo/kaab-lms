/**
 * Complete Mission Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, DuplicateEntityError } from '@/core/shared/errors';
import { IMissionRepository } from '../../domain/mission.repository.interface';
import { IUserGamificationRepository } from '../../domain/user-gamification.repository.interface';
import { CompleteMissionDTO } from '../dtos';

interface CompleteMissionRequest {
  dto: CompleteMissionDTO;
  currentUserId: string;
}

export class CompleteMissionUseCase extends BaseUseCase<
  CompleteMissionRequest,
  void
> {
  constructor(
    private missionRepository: IMissionRepository,
    private userGamificationRepository: IUserGamificationRepository
  ) {
    super();
  }

  async execute(request: CompleteMissionRequest): Promise<Result<void>> {
    const { dto } = request;

    // Find mission
    const missionResult = await this.missionRepository.findById(dto.missionId);

    if (missionResult.isFailure) {
      return Result.fail(missionResult.error);
    }

    if (!missionResult.value) {
      return Result.fail(new NotFoundError('Mission', dto.missionId));
    }

    const mission = missionResult.value;

    // Check if user has already completed mission
    const hasCompletedResult =
      await this.missionRepository.userHasCompletedMission(
        dto.userId,
        dto.missionId
      );

    if (hasCompletedResult.isFailure) {
      return Result.fail(hasCompletedResult.error);
    }

    if (hasCompletedResult.value) {
      return Result.fail(
        new DuplicateEntityError(
          'User has already completed this mission',
          'missionId',
          dto.missionId
        )
      );
    }

    // Complete mission
    const completeResult = mission.complete(dto.userId);

    if (completeResult.isFailure) {
      return Result.fail(completeResult.error);
    }

    // Mark mission as completed for user
    const completeMissionResult =
      await this.missionRepository.completeMissionForUser(
        dto.userId,
        dto.missionId
      );

    if (completeMissionResult.isFailure) {
      return Result.fail(completeMissionResult.error);
    }

    // Get or create user gamification profile
    const userGamificationResult =
      await this.userGamificationRepository.getOrCreate(dto.userId);

    if (userGamificationResult.isFailure) {
      return Result.fail(userGamificationResult.error);
    }

    const userGamification = userGamificationResult.value;

    // Add XP reward
    if (mission.xpReward > 0) {
      const addXpResult = userGamification.addXp(
        mission.xpReward,
        `Mission completed: ${mission.title}`
      );

      if (addXpResult.isFailure) {
        return Result.fail(addXpResult.error);
      }
    }

    // Add coin reward
    if (mission.coinReward > 0) {
      const addCoinsResult = userGamification.addCoins(
        mission.coinReward,
        `Mission completed: ${mission.title}`
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
