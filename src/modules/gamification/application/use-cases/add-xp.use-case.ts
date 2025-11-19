/**
 * Add XP Use Case
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IUserGamificationRepository } from '../../domain/user-gamification.repository.interface'
import { type UserGamificationDTO, userGamificationMapper } from '../../infrastructure/user-gamification.mapper'
import type { AddXpDTO } from '../dtos'

interface AddXpRequest {
  dto: AddXpDTO
  currentUserId: string
}

export class AddXpUseCase extends BaseUseCase<AddXpRequest, UserGamificationDTO> {
  constructor(private userGamificationRepository: IUserGamificationRepository) {
    super()
  }

  async execute(request: AddXpRequest): Promise<Result<UserGamificationDTO>> {
    const { dto } = request

    // Get or create user gamification profile
    const userGamificationResult = await this.userGamificationRepository.getOrCreate(dto.userId)

    if (userGamificationResult.isFailure) {
      return Result.fail(userGamificationResult.error)
    }

    const userGamification = userGamificationResult.value

    // Add XP
    const addXpResult = userGamification.addXp(dto.amount, dto.reason)

    if (addXpResult.isFailure) {
      return Result.fail(addXpResult.error)
    }

    // Update streak
    const updateStreakResult = userGamification.updateStreak()

    if (updateStreakResult.isFailure) {
      return Result.fail(updateStreakResult.error)
    }

    // Save user gamification
    const saveResult = await this.userGamificationRepository.save(userGamification)

    if (saveResult.isFailure) {
      return Result.fail(saveResult.error)
    }

    // Map to DTO
    const userGamificationDTO = userGamificationMapper.toDTO(saveResult.value)

    return Result.ok(userGamificationDTO)
  }
}
