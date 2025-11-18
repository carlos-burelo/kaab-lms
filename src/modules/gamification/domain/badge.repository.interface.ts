/**
 * Badge Repository Interface
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { Badge } from './badge.entity';
import { BadgeRarity } from './value-objects';

export interface IBadgeRepository extends Repository<Badge> {
  /**
   * Find badges by rarity
   */
  findByRarity(rarity: BadgeRarity): Promise<Result<Badge[]>>;

  /**
   * Find all badges
   */
  findAllBadges(): Promise<Result<Badge[]>>;

  /**
   * Check if user has earned a badge
   */
  userHasBadge(userId: string, badgeId: string): Promise<Result<boolean>>;

  /**
   * Get user's badges
   */
  getUserBadges(userId: string): Promise<Result<Badge[]>>;

  /**
   * Award badge to user
   */
  awardBadgeToUser(userId: string, badgeId: string): Promise<Result<void>>;
}
