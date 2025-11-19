/**
 * Update Badge Use Case
 */

import { NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IBadgeRepository } from '../../domain/badge.repository.interface'
import { type BadgeDTO, badgeMapper } from '../../infrastructure/badge.mapper'
import type { UpdateBadgeDTO } from '../dtos'

interface UpdateBadgeRequest {
  badgeId: string
  dto: UpdateBadgeDTO
  currentUserId: string
}

export class UpdateBadgeUseCase extends BaseUseCase<UpdateBadgeRequest, BadgeDTO> {
  constructor(private badgeRepository: IBadgeRepository) {
    super()
  }

  async execute(request: UpdateBadgeRequest): Promise<Result<BadgeDTO>> {
    const { badgeId, dto } = request

    // Find badge
    const badgeResult = await this.badgeRepository.findById(badgeId)

    if (badgeResult.isFailure) {
      return Result.fail(badgeResult.error)
    }

    if (!badgeResult.value) {
      return Result.fail(new NotFoundError('Badge', badgeId))
    }

    const badge = badgeResult.value

    // Update properties
    if (dto.name) {
      const updateNameResult = badge.updateName(dto.name)
      if (updateNameResult.isFailure) {
        return Result.fail(updateNameResult.error)
      }
    }

    if (dto.description) {
      const updateDescriptionResult = badge.updateDescription(dto.description)
      if (updateDescriptionResult.isFailure) {
        return Result.fail(updateDescriptionResult.error)
      }
    }

    if (dto.imageId) {
      badge.updateImage(dto.imageId)
    }

    if (dto.rarity) {
      badge.updateRarity(dto.rarity)
    }

    if (dto.condition) {
      const updateConditionResult = badge.updateCondition(dto.condition)
      if (updateConditionResult.isFailure) {
        return Result.fail(updateConditionResult.error)
      }
    }

    // Save updated badge
    const savedResult = await this.badgeRepository.save(badge)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const badgeDTO = badgeMapper.toDTO(savedResult.value)

    return Result.ok(badgeDTO)
  }
}
