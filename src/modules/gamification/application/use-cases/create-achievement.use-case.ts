/**
 * Create Achievement Use Case
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { Achievement } from '../../domain/achievement.entity'
import type { IAchievementRepository } from '../../domain/achievement.repository.interface'
import { type AchievementDTO, achievementMapper } from '../../infrastructure/achievement.mapper'
import type { CreateAchievementDTO } from '../dtos'

interface CreateAchievementRequest {
  dto: CreateAchievementDTO
  currentUserId: string
}

export class CreateAchievementUseCase extends BaseUseCase<CreateAchievementRequest, AchievementDTO> {
  constructor(private achievementRepository: IAchievementRepository) {
    super()
  }

  async execute(request: CreateAchievementRequest): Promise<Result<AchievementDTO>> {
    const { dto } = request

    // Create achievement entity
    const achievementResult = Achievement.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      imageId: dto.imageId,
      xpReward: dto.xpReward,
      coinReward: dto.coinReward,
      maxProgress: dto.maxProgress
    })

    if (achievementResult.isFailure) {
      return Result.fail(achievementResult.error)
    }

    // Save to repository
    const savedResult = await this.achievementRepository.save(achievementResult.value)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const achievementDTO = achievementMapper.toDTO(savedResult.value)

    return Result.ok(achievementDTO)
  }
}
