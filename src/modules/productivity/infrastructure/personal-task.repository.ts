/**
 * PersonalTask Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import type { PersonalTask } from '../domain/personal-task.entity';
import type { IPersonalTaskRepository } from '../domain/personal-task.repository.interface';
import { type TaskPriority, TaskStatus } from '../domain/value-objects';
import { personalTaskMapper } from './personal-task.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class PersonalTaskRepository implements IPersonalTaskRepository {
  async findById(id: string): Promise<Result<PersonalTask | null>> {
    try {
      const task = await prisma.personalTask.findUnique({
        where: { id },
      });

      if (!task) return Result.ok(null);

      return Result.ok(personalTaskMapper.toDomain(task));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find task', error as Error)
      );
    }
  }

  async findByUserId(userId: string): Promise<Result<PersonalTask[]>> {
    try {
      const tasks = await prisma.personalTask.findMany({
        where: { userId },
        orderBy: [
          { status: 'asc' },
          { dueDate: 'asc' },
          { priority: 'desc' },
        ],
      });

      return Result.ok(tasks.map(task => personalTaskMapper.toDomain(task)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find tasks by user', error as Error)
      );
    }
  }

  async findByUserAndStatus(
    userId: string,
    status: TaskStatus
  ): Promise<Result<PersonalTask[]>> {
    try {
      const tasks = await prisma.personalTask.findMany({
        where: { userId, status },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' },
        ],
      });

      return Result.ok(tasks.map(task => personalTaskMapper.toDomain(task)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find tasks by user and status', error as Error)
      );
    }
  }

  async findByUserAndPriority(
    userId: string,
    priority: TaskPriority
  ): Promise<Result<PersonalTask[]>> {
    try {
      const tasks = await prisma.personalTask.findMany({
        where: { userId, priority },
        orderBy: [
          { status: 'asc' },
          { dueDate: 'asc' },
        ],
      });

      return Result.ok(tasks.map(task => personalTaskMapper.toDomain(task)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find tasks by user and priority', error as Error)
      );
    }
  }

  async findOverdueTasks(userId: string): Promise<Result<PersonalTask[]>> {
    try {
      const now = new Date();
      const tasks = await prisma.personalTask.findMany({
        where: {
          userId,
          dueDate: {
            lt: now,
          },
          status: {
            notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
          },
        },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' },
        ],
      });

      return Result.ok(tasks.map(task => personalTaskMapper.toDomain(task)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find overdue tasks', error as Error)
      );
    }
  }

  async findTasksDueToday(userId: string): Promise<Result<PersonalTask[]>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasks = await prisma.personalTask.findMany({
        where: {
          userId,
          dueDate: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
          },
        },
        orderBy: [
          { priority: 'desc' },
        ],
      });

      return Result.ok(tasks.map(task => personalTaskMapper.toDomain(task)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find tasks due today', error as Error)
      );
    }
  }

  async countByStatus(
    userId: string,
    status: TaskStatus
  ): Promise<Result<number>> {
    try {
      const count = await prisma.personalTask.count({
        where: { userId, status },
      });

      return Result.ok(count);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to count tasks by status', error as Error)
      );
    }
  }

  async getTaskStats(
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
  > {
    try {
      const now = new Date();

      const [
        total,
        pending,
        inProgress,
        completed,
        cancelled,
        overdue,
      ] = await Promise.all([
        prisma.personalTask.count({ where: { userId } }),
        prisma.personalTask.count({ where: { userId, status: TaskStatus.PENDING } }),
        prisma.personalTask.count({ where: { userId, status: TaskStatus.IN_PROGRESS } }),
        prisma.personalTask.count({ where: { userId, status: TaskStatus.COMPLETED } }),
        prisma.personalTask.count({ where: { userId, status: TaskStatus.CANCELLED } }),
        prisma.personalTask.count({
          where: {
            userId,
            dueDate: { lt: now },
            status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
          },
        }),
      ]);

      return Result.ok({
        total,
        pending,
        inProgress,
        completed,
        cancelled,
        overdue,
      });
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get task stats', error as Error)
      );
    }
  }

  async save(entity: PersonalTask): Promise<Result<PersonalTask>> {
    try {
      const model = personalTaskMapper.toPersistence(entity);

      const saved = await prisma.personalTask.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(personalTaskMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save task', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.personalTask.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to delete task', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.personalTask.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check task existence', error as Error)
      );
    }
  }
}
