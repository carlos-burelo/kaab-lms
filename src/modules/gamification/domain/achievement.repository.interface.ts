/**
 * Achievement Repository Interface
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { Achievement } from './achievement.entity';
import { AchievementCategory } from './value-objects';

export interface IAchievementRepository extends Repository<Achievement> {
  /**
   * Find achievements by category
   */
  findByCategory(category: AchievementCategory): Promise<Result<Achievement[]>>;

  /**
   * Find all achievements
   */
  findAllAchievements(): Promise<Result<Achievement[]>>;

  /**
   * Get user's achievements with progress
   */
  getUserAchievements(
    userId: string
  ): Promise<
    Result<
      Array<{
        achievement: Achievement;
        progress: number;
        unlockedAt?: Date;
      }>
    >
  >;

  /**
   * Check if user has unlocked an achievement
   */
  userHasAchievement(
    userId: string,
    achievementId: string
  ): Promise<Result<boolean>>;

  /**
   * Update user achievement progress
   */
  updateUserAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<Result<void>>;

  /**
   * Unlock achievement for user
   */
  unlockAchievementForUser(
    userId: string,
    achievementId: string
  ): Promise<Result<void>>;
}
