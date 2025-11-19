/**
 * Award Badge Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, DuplicateEntityError } from '@/core/shared/errors';
import type { IBadgeRepository } from '../../domain/badge.repository.interface';
import type { IUserGamificationRepository } from '../../domain/user-gamification.repository.interface';
import type { AwardBadgeDTO } from '../dtos';

interface AwardBadgeRequest {
  dto: AwardBadgeDTO;
  currentUserId: string;
}

export class AwardBadgeUseCase extends BaseUseCase<AwardBadgeRequest, void> {
  constructor(
    private badgeRepository: IBadgeRepository,
    private userGamificationRepository: IUserGamificationRepository
  ) {
    super();
  }

  async execute(request: AwardBadgeRequest): Promise<Result<void>> {
    const { dto } = request;

    // Find badge
    const badgeResult = await this.badgeRepository.findById(dto.badgeId);

    if (badgeResult.isFailure) {
      return Result.fail(badgeResult.error);
    }

    if (!badgeResult.value) {
      return Result.fail(new NotFoundError('Badge', dto.badgeId));
    }

    const badge = badgeResult.value;

    // Check if user already has badge
    const hasBadgeResult = await this.badgeRepository.userHasBadge(
      dto.userId,
      dto.badgeId
    );

    if (hasBadgeResult.isFailure) {
      return Result.fail(hasBadgeResult.error);
    }

    if (hasBadgeResult.value) {
      return Result.fail(
        new DuplicateEntityError('User already has this badge', 'badgeId', dto.badgeId)
      );
    }

    // Award badge
    const awardResult = badge.award(dto.userId);

    if (awardResult.isFailure) {
      return Result.fail(awardResult.error);
    }

    // Award badge to user (this should be handled by a domain event handler)
    const awardToUserResult = await this.badgeRepository.awardBadgeToUser(
      dto.userId,
      dto.badgeId
    );

    if (awardToUserResult.isFailure) {
      return Result.fail(awardToUserResult.error);
    }

    // Get or create user gamification profile
    const userGamificationResult =
      await this.userGamificationRepository.getOrCreate(dto.userId);

    if (userGamificationResult.isFailure) {
      return Result.fail(userGamificationResult.error);
    }

    const userGamification = userGamificationResult.value;

    // Increment badge count
    userGamification.awardBadge();

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
