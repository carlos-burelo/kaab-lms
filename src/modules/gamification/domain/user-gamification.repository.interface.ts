/**
 * UserGamification Repository Interface
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { UserGamification } from './user-gamification.entity';

export interface IUserGamificationRepository
  extends Repository<UserGamification> {
  /**
   * Find user gamification profile by user ID
   */
  findByUserId(userId: string): Promise<Result<UserGamification | null>>;

  /**
   * Get or create user gamification profile
   */
  getOrCreate(userId: string): Promise<Result<UserGamification>>;

  /**
   * Get leaderboard (top users by XP)
   */
  getLeaderboard(
    limit: number,
    offset: number
  ): Promise<
    Result<
      Array<{
        user: UserGamification;
        rank: number;
      }>
    >
  >;

  /**
   * Get user's rank
   */
  getUserRank(userId: string): Promise<Result<number>>;

  /**
   * Find users by level range
   */
  findByLevelRange(minLevel: number, maxLevel: number): Promise<Result<UserGamification[]>>;

  /**
   * Get total users count
   */
  getTotalUsersCount(): Promise<Result<number>>;
}
