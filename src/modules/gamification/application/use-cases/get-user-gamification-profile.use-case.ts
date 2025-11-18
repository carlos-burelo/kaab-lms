/**
 * Get User Gamification Profile Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { IUserGamificationRepository } from '../../domain/user-gamification.repository.interface';
import {
  UserGamificationDTO,
  userGamificationMapper,
} from '../../infrastructure/user-gamification.mapper';

interface GetUserGamificationProfileRequest {
  userId: string;
  currentUserId: string;
}

export class GetUserGamificationProfileUseCase extends BaseUseCase<
  GetUserGamificationProfileRequest,
  UserGamificationDTO
> {
  constructor(
    private userGamificationRepository: IUserGamificationRepository
  ) {
    super();
  }

  async execute(
    request: GetUserGamificationProfileRequest
  ): Promise<Result<UserGamificationDTO>> {
    const { userId } = request;

    // Get or create user gamification profile
    const userGamificationResult =
      await this.userGamificationRepository.getOrCreate(userId);

    if (userGamificationResult.isFailure) {
      return Result.fail(userGamificationResult.error);
    }

    // Map to DTO
    const userGamificationDTO = userGamificationMapper.toDTO(
      userGamificationResult.value
    );

    return Result.ok(userGamificationDTO);
  }
}
