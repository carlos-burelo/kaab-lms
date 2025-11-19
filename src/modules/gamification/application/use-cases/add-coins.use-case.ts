/**
 * Add Coins Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import type { IUserGamificationRepository } from '../../domain/user-gamification.repository.interface';
import type { AddCoinsDTO } from '../dtos';
import {
  type UserGamificationDTO,
  userGamificationMapper,
} from '../../infrastructure/user-gamification.mapper';

interface AddCoinsRequest {
  dto: AddCoinsDTO;
  currentUserId: string;
}

export class AddCoinsUseCase extends BaseUseCase<
  AddCoinsRequest,
  UserGamificationDTO
> {
  constructor(
    private userGamificationRepository: IUserGamificationRepository
  ) {
    super();
  }

  async execute(
    request: AddCoinsRequest
  ): Promise<Result<UserGamificationDTO>> {
    const { dto } = request;

    // Get or create user gamification profile
    const userGamificationResult =
      await this.userGamificationRepository.getOrCreate(dto.userId);

    if (userGamificationResult.isFailure) {
      return Result.fail(userGamificationResult.error);
    }

    const userGamification = userGamificationResult.value;

    // Add coins
    const addCoinsResult = userGamification.addCoins(dto.amount, dto.reason);

    if (addCoinsResult.isFailure) {
      return Result.fail(addCoinsResult.error);
    }

    // Save user gamification
    const saveResult = await this.userGamificationRepository.save(
      userGamification
    );

    if (saveResult.isFailure) {
      return Result.fail(saveResult.error);
    }

    // Map to DTO
    const userGamificationDTO = userGamificationMapper.toDTO(saveResult.value);

    return Result.ok(userGamificationDTO);
  }
}
