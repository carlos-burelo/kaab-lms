/**
 * Get Achievement Use Case
 */

import { NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IAchievementRepository } from '../../domain/achievement.repository.interface'
import { type AchievementDTO, achievementMapper } from '../../infrastructure/achievement.mapper'

interface GetAchievementRequest {
  achievementId: string
  currentUserId: string
}

export class GetAchievementUseCase extends BaseUseCase<GetAchievementRequest, AchievementDTO> {
  constructor(private achievementRepository: IAchievementRepository) {
    super()
  }

  async execute(request: GetAchievementRequest): Promise<Result<AchievementDTO>> {
    const { achievementId } = request

    // Find achievement
    const achievementResult = await this.achievementRepository.findById(achievementId)

    if (achievementResult.isFailure) {
      return Result.fail(achievementResult.error)
    }

    if (!achievementResult.value) {
      return Result.fail(new NotFoundError('Achievement', achievementId))
    }

    // Map to DTO
    const achievementDTO = achievementMapper.toDTO(achievementResult.value)

    return Result.ok(achievementDTO)
  }
}
