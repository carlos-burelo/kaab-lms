/**
 * Notification Repository Implementation
 */

import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { Notification } from '../domain/notification.entity'
import type { INotificationRepository } from '../domain/notification.repository.interface'
import type { NotificationTypeEnum } from '../domain/value-objects/notification-type'
import { notificationMapper } from './notification.mapper'

export class NotificationRepository implements INotificationRepository {
  async findById(id: string): Promise<Result<Notification | null>> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id }
      })

      if (!notification) return Result.ok(null)

      return Result.ok(notificationMapper.toDomain(notification))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find notification', _error as Error))
    }
  }

  async findByUserId(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      isRead?: boolean
      type?: NotificationTypeEnum
    }
  ): Promise<Result<Notification[]>> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(options?.isRead !== undefined && { isRead: options.isRead }),
          ...(options?.type && { type: options.type })
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: options?.limit || 20,
        skip: options?.offset || 0
      })

      const domainNotifications = notifications.map((notification) => notificationMapper.toDomain(notification))

      return Result.ok(domainNotifications)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find notifications by user', _error as Error))
    }
  }

  async getUnreadCount(userId: string): Promise<Result<number>> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      })

      return Result.ok(count)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get unread count', _error as Error))
    }
  }

  async markAllAsRead(userId: string): Promise<Result<void>> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to mark all as read', _error as Error))
    }
  }

  async deleteOldReadNotifications(userId: string, daysOld: number): Promise<Result<void>> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true,
          readAt: {
            lt: cutoffDate
          }
        }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete old notifications', _error as Error))
    }
  }

  async save(entity: Notification): Promise<Result<Notification>> {
    try {
      const model = notificationMapper.toPersistence(entity)

      const saved = await prisma.notification.upsert({
        where: { id: entity.id },
        create: model,
        update: model
      })

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event)
      }
      entity.clearEvents()

      return Result.ok(notificationMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save notification', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.notification.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete notification', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.notification.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check notification existence', _error as Error))
    }
  }
}
