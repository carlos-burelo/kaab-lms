/**
 * Update Achievement Use Case
 */

import { NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IAchievementRepository } from '../../domain/achievement.repository.interface'
import { type AchievementDTO, achievementMapper } from '../../infrastructure/achievement.mapper'
import type { UpdateAchievementDTO } from '../dtos'

interface UpdateAchievementRequest {
  achievementId: string
  dto: UpdateAchievementDTO
  currentUserId: string
}

export class UpdateAchievementUseCase extends BaseUseCase<UpdateAchievementRequest, AchievementDTO> {
  constructor(private achievementRepository: IAchievementRepository) {
    super()
  }

  async execute(request: UpdateAchievementRequest): Promise<Result<AchievementDTO>> {
    const { achievementId, dto } = request

    // Find achievement
    const achievementResult = await this.achievementRepository.findById(achievementId)

    if (achievementResult.isFailure) {
      return Result.fail(achievementResult.error)
    }

    if (!achievementResult.value) {
      return Result.fail(new NotFoundError('Achievement', achievementId))
    }

    const achievement = achievementResult.value

    // Update properties
    if (dto.name) {
      const updateNameResult = achievement.updateName(dto.name)
      if (updateNameResult.isFailure) {
        return Result.fail(updateNameResult.error)
      }
    }

    if (dto.description) {
      const updateDescriptionResult = achievement.updateDescription(dto.description)
      if (updateDescriptionResult.isFailure) {
        return Result.fail(updateDescriptionResult.error)
      }
    }

    if (dto.category) {
      achievement.updateCategory(dto.category)
    }

    if (dto.imageId) {
      achievement.updateImage(dto.imageId)
    }

    if (dto.xpReward !== undefined) {
      const updateXpRewardResult = achievement.updateXpReward(dto.xpReward)
      if (updateXpRewardResult.isFailure) {
        return Result.fail(updateXpRewardResult.error)
      }
    }

    if (dto.coinReward !== undefined) {
      const updateCoinRewardResult = achievement.updateCoinReward(dto.coinReward)
      if (updateCoinRewardResult.isFailure) {
        return Result.fail(updateCoinRewardResult.error)
      }
    }

    if (dto.maxProgress !== undefined) {
      const updateMaxProgressResult = achievement.updateMaxProgress(dto.maxProgress)
      if (updateMaxProgressResult.isFailure) {
        return Result.fail(updateMaxProgressResult.error)
      }
    }

    // Save updated achievement
    const savedResult = await this.achievementRepository.save(achievement)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const achievementDTO = achievementMapper.toDTO(savedResult.value)

    return Result.ok(achievementDTO)
  }
}
