/**
 * Create Badge Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { Badge } from '../../domain/badge.entity';
import type { IBadgeRepository } from '../../domain/badge.repository.interface';
import type { CreateBadgeDTO } from '../dtos';
import { type BadgeDTO, badgeMapper } from '../../infrastructure/badge.mapper';

interface CreateBadgeRequest {
  dto: CreateBadgeDTO;
  currentUserId: string;
}

export class CreateBadgeUseCase extends BaseUseCase<
  CreateBadgeRequest,
  BadgeDTO
> {
  constructor(private badgeRepository: IBadgeRepository) {
    super();
  }

  async execute(request: CreateBadgeRequest): Promise<Result<BadgeDTO>> {
    const { dto } = request;

    // Create badge entity
    const badgeResult = Badge.create({
      name: dto.name,
      description: dto.description,
      imageId: dto.imageId,
      rarity: dto.rarity,
      condition: dto.condition,
    });

    if (badgeResult.isFailure) {
      return Result.fail(badgeResult.error);
    }

    // Save to repository
    const savedResult = await this.badgeRepository.save(badgeResult.value);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const badgeDTO = badgeMapper.toDTO(savedResult.value);

    return Result.ok(badgeDTO);
  }
}
