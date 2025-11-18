/**
 * PersonalTask Repository Interface
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { PersonalTask } from './personal-task.entity';
import { TaskStatus, TaskPriority } from './value-objects';

export interface IPersonalTaskRepository extends Repository<PersonalTask> {
  /**
   * Find all tasks by user ID
   */
  findByUserId(userId: string): Promise<Result<PersonalTask[]>>;

  /**
   * Find tasks by user and status
   */
  findByUserAndStatus(
    userId: string,
    status: TaskStatus
  ): Promise<Result<PersonalTask[]>>;

  /**
   * Find tasks by user and priority
   */
  findByUserAndPriority(
    userId: string,
    priority: TaskPriority
  ): Promise<Result<PersonalTask[]>>;

  /**
   * Find overdue tasks for a user
   */
  findOverdueTasks(userId: string): Promise<Result<PersonalTask[]>>;

  /**
   * Find tasks due today for a user
   */
  findTasksDueToday(userId: string): Promise<Result<PersonalTask[]>>;

  /**
   * Count tasks by status for a user
   */
  countByStatus(
    userId: string,
    status: TaskStatus
  ): Promise<Result<number>>;

  /**
   * Get task statistics for a user
   */
  getTaskStats(
    userId: string
  ): Promise<
    Result<{
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      cancelled: number;
      overdue: number;
    }>
  >;
}
