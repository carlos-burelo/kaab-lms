/**
 * Learning Path Repository Interface
 */

import type { Repository } from '@/core/shared/repository.interface';
import type { Result } from '@/core/shared/result';
import type { LearningPath } from './learning-path.entity';
import type { UserLearningPathProgress } from './user-learning-path-progress.entity';

export interface ILearningPathRepository extends Repository<LearningPath> {
  /**
   * Find learning path with all nodes and edges
   */
  findByIdWithGraph(id: string): Promise<Result<LearningPath | null>>;

  /**
   * Find all published learning paths
   */
  findAllPublished(): Promise<Result<LearningPath[]>>;

  /**
   * Find learning paths created by a user
   */
  findByCreator(creatorId: string): Promise<Result<LearningPath[]>>;

  /**
   * Get user progress for a learning path
   */
  getUserProgress(
    userId: string,
    learningPathId: string
  ): Promise<Result<UserLearningPathProgress | null>>;

  /**
   * Save user progress
   */
  saveUserProgress(
    progress: UserLearningPathProgress
  ): Promise<Result<UserLearningPathProgress>>;

  /**
   * Check if user has started a learning path
   */
  hasUserStarted(
    userId: string,
    learningPathId: string
  ): Promise<Result<boolean>>;

  /**
   * Get all learning paths in progress for a user
   */
  findUserInProgress(userId: string): Promise<Result<LearningPath[]>>;

  /**
   * Get all completed learning paths for a user
   */
  findUserCompleted(userId: string): Promise<Result<LearningPath[]>>;

  /**
   * Get learning path statistics
   */
  getStats(
    learningPathId: string
  ): Promise<
    Result<{
      totalUsers: number;
      completedUsers: number;
      averageProgress: number;
      completionRate: number;
    }>
  >;
}
