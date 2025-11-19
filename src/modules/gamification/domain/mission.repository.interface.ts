/**
 * Mission Repository Interface
 */

import type { Repository } from '@/core/shared/repository.interface';
import type { Result } from '@/core/shared/result';
import type { Mission } from './mission.entity';
import type { MissionType, MissionDifficulty } from './value-objects';

export interface IMissionRepository extends Repository<Mission> {
  /**
   * Find missions by type
   */
  findByType(type: MissionType): Promise<Result<Mission[]>>;

  /**
   * Find missions by difficulty
   */
  findByDifficulty(difficulty: MissionDifficulty): Promise<Result<Mission[]>>;

  /**
   * Find active missions
   */
  findActiveMissions(): Promise<Result<Mission[]>>;

  /**
   * Find user's active missions
   */
  findUserActiveMissions(userId: string): Promise<Result<Mission[]>>;

  /**
   * Find user's completed missions
   */
  findUserCompletedMissions(userId: string): Promise<Result<Mission[]>>;

  /**
   * Check if user has completed a mission
   */
  userHasCompletedMission(
    userId: string,
    missionId: string
  ): Promise<Result<boolean>>;

  /**
   * Mark mission as completed for user
   */
  completeMissionForUser(
    userId: string,
    missionId: string
  ): Promise<Result<void>>;

  /**
   * Get user mission progress
   */
  getUserMissionProgress(
    userId: string,
    missionId: string
  ): Promise<Result<{ progress: number; completedAt?: Date } | null>>;
}
