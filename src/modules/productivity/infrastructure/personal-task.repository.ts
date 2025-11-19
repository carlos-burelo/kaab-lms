/**
 * PersonalTask Repository Implementation
 */

import { PersonalTaskStatus } from '@prisma/client'
import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { PersonalTask } from '../domain/personal-task.entity'
import type { IPersonalTaskRepository } from '../domain/personal-task.repository.interface'
import type { TaskPriority } from '../domain/value-objects'
import { personalTaskMapper } from './personal-task.mapper'

export class PersonalTaskRepository implements IPersonalTaskRepository {
  async findById(id: string): Promise<Result<PersonalTask | null>> {
    try {
      const task = await prisma.personalTask.findUnique({
        where: { id }
      })

      if (!task) return Result.ok(null)

      return Result.ok(personalTaskMapper.toDomain(task))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find task', _error as Error))
    }
  }

  async findByUserId(userId: string): Promise<Result<PersonalTask[]>> {
    try {
      const tasks = await prisma.personalTask.findMany({
        where: { userId },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { priority: 'desc' }]
      })

      return Result.ok(tasks.map((task) => personalTaskMapper.toDomain(task)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find tasks by user', _error as Error))
    }
  }

  async findByUserAndStatus(userId: string, status: PersonalTaskStatus): Promise<Result<PersonalTask[]>> {
    try {
      const tasks = await prisma.personalTask.findMany({
        where: { userId, status },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }]
      })

      return Result.ok(tasks.map((task) => personalTaskMapper.toDomain(task)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find tasks by user and status', _error as Error))
    }
  }

  async findByUserAndPriority(userId: string, priority: TaskPriority): Promise<Result<PersonalTask[]>> {
    try {
      const tasks = await prisma.personalTask.findMany({
        where: { userId, priority },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }]
      })

      return Result.ok(tasks.map((task) => personalTaskMapper.toDomain(task)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find tasks by user and priority', _error as Error))
    }
  }

  async findOverdueTasks(userId: string): Promise<Result<PersonalTask[]>> {
    try {
      const now = new Date()
      const tasks = await prisma.personalTask.findMany({
        where: {
          userId,
          dueDate: {
            lt: now
          },
          status: {
            notIn: [PersonalTaskStatus.COMPLETED, PersonalTaskStatus.CANCELED]
          }
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }]
      })

      return Result.ok(tasks.map((task) => personalTaskMapper.toDomain(task)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find overdue tasks', _error as Error))
    }
  }

  async findTasksDueToday(userId: string): Promise<Result<PersonalTask[]>> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const tasks = await prisma.personalTask.findMany({
        where: {
          userId,
          dueDate: {
            gte: today,
            lt: tomorrow
          },
          status: {
            notIn: [PersonalTaskStatus.COMPLETED, PersonalTaskStatus.CANCELED]
          }
        },
        orderBy: [{ priority: 'desc' }]
      })

      return Result.ok(tasks.map((task) => personalTaskMapper.toDomain(task)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find tasks due today', _error as Error))
    }
  }

  async countByStatus(userId: string, status: PersonalTaskStatus): Promise<Result<number>> {
    try {
      const count = await prisma.personalTask.count({
        where: { userId, status }
      })

      return Result.ok(count)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to count tasks by status', _error as Error))
    }
  }

  async getTaskStats(userId: string): Promise<
    Result<{
      total: number
      pending: number
      inProgress: number
      completed: number
      cancelled: number
      overdue: number
    }>
  > {
    try {
      const now = new Date()

      const [total, pending, inProgress, completed, cancelled, overdue] = await Promise.all([
        prisma.personalTask.count({ where: { userId } }),
        prisma.personalTask.count({ where: { userId, status: PersonalTaskStatus.PENDING } }),
        prisma.personalTask.count({ where: { userId, status: PersonalTaskStatus.IN_PROGRESS } }),
        prisma.personalTask.count({ where: { userId, status: PersonalTaskStatus.COMPLETED } }),
        prisma.personalTask.count({ where: { userId, status: PersonalTaskStatus.CANCELED } }),
        prisma.personalTask.count({
          where: {
            userId,
            dueDate: { lt: now },
            status: { notIn: [PersonalTaskStatus.COMPLETED, PersonalTaskStatus.CANCELED] }
          }
        })
      ])

      return Result.ok({
        total,
        pending,
        inProgress,
        completed,
        cancelled,
        overdue
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get task stats', _error as Error))
    }
  }

  async save(entity: PersonalTask): Promise<Result<PersonalTask>> {
    try {
      const model = personalTaskMapper.toPersistence(entity)

      const saved = await prisma.personalTask.upsert({
        where: { id: entity.id },
        create: model,
        update: model
      })

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event)
      }
      entity.clearEvents()

      return Result.ok(personalTaskMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save task', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.personalTask.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete task', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.personalTask.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check task existence', _error as Error))
    }
  }
}
