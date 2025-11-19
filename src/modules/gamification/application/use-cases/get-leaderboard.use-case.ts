/**
 * Get Leaderboard Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import type { IUserGamificationRepository } from '../../domain/user-gamification.repository.interface';
import {
  type UserGamificationDTO,
  userGamificationMapper,
} from '../../infrastructure/user-gamification.mapper';

interface GetLeaderboardRequest {
  limit?: number;
  offset?: number;
  currentUserId: string;
}

interface LeaderboardEntryDTO {
  user: UserGamificationDTO;
  rank: number;
}

export class GetLeaderboardUseCase extends BaseUseCase<
  GetLeaderboardRequest,
  LeaderboardEntryDTO[]
> {
  constructor(
    private userGamificationRepository: IUserGamificationRepository
  ) {
    super();
  }

  async execute(
    request: GetLeaderboardRequest
  ): Promise<Result<LeaderboardEntryDTO[]>> {
    const { limit = 10, offset = 0 } = request;

    // Get leaderboard
    const leaderboardResult =
      await this.userGamificationRepository.getLeaderboard(limit, offset);

    if (leaderboardResult.isFailure) {
      return Result.fail(leaderboardResult.error);
    }

    // Map to DTOs
    const leaderboardDTOs = leaderboardResult.value.map((entry) => ({
      user: userGamificationMapper.toDTO(entry.user),
      rank: entry.rank,
    }));

    return Result.ok(leaderboardDTOs);
  }
}
