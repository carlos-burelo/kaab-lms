/**
 * Get User Badges Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import type { IBadgeRepository } from '../../domain/badge.repository.interface';
import { type BadgeDTO, badgeMapper } from '../../infrastructure/badge.mapper';

interface GetUserBadgesRequest {
  userId: string;
  currentUserId: string;
}

export class GetUserBadgesUseCase extends BaseUseCase<
  GetUserBadgesRequest,
  BadgeDTO[]
> {
  constructor(private badgeRepository: IBadgeRepository) {
    super();
  }

  async execute(request: GetUserBadgesRequest): Promise<Result<BadgeDTO[]>> {
    const { userId } = request;

    // Get user badges
    const badgesResult = await this.badgeRepository.getUserBadges(userId);

    if (badgesResult.isFailure) {
      return Result.fail(badgesResult.error);
    }

    // Map to DTOs
    const badgeDTOs = badgesResult.value.map((badge) =>
      badgeMapper.toDTO(badge)
    );

    return Result.ok(badgeDTOs);
  }
}
