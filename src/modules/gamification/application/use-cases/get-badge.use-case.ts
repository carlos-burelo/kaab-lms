/**
 * Get Badge Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import { IBadgeRepository } from '../../domain/badge.repository.interface';
import { BadgeDTO, badgeMapper } from '../../infrastructure/badge.mapper';

interface GetBadgeRequest {
  badgeId: string;
  currentUserId: string;
}

export class GetBadgeUseCase extends BaseUseCase<GetBadgeRequest, BadgeDTO> {
  constructor(private badgeRepository: IBadgeRepository) {
    super();
  }

  async execute(request: GetBadgeRequest): Promise<Result<BadgeDTO>> {
    const { badgeId } = request;

    // Find badge
    const badgeResult = await this.badgeRepository.findById(badgeId);

    if (badgeResult.isFailure) {
      return Result.fail(badgeResult.error);
    }

    if (!badgeResult.value) {
      return Result.fail(new NotFoundError('Badge', badgeId));
    }

    // Map to DTO
    const badgeDTO = badgeMapper.toDTO(badgeResult.value);

    return Result.ok(badgeDTO);
  }
}
