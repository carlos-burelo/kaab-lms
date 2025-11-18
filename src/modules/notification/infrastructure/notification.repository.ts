/**
 * Notification Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import { Notification } from '../domain/notification.entity';
import { INotificationRepository } from '../domain/notification.repository.interface';
import { NotificationTypeEnum } from '../domain/value-objects/notification-type';
import { notificationMapper } from './notification.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class NotificationRepository implements INotificationRepository {
  async findById(id: string): Promise<Result<Notification | null>> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) return Result.ok(null);

      return Result.ok(notificationMapper.toDomain(notification));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find notification', error as Error)
      );
    }
  }

  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      isRead?: boolean;
      type?: NotificationTypeEnum;
    }
  ): Promise<Result<Notification[]>> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(options?.isRead !== undefined && { isRead: options.isRead }),
          ...(options?.type && { type: options.type }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: options?.limit || 20,
        skip: options?.offset || 0,
      });

      const domainNotifications = notifications.map((notification) =>
        notificationMapper.toDomain(notification)
      );

      return Result.ok(domainNotifications);
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to find notifications by user',
          error as Error
        )
      );
    }
  }

  async getUnreadCount(userId: string): Promise<Result<number>> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return Result.ok(count);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get unread count', error as Error)
      );
    }
  }

  async markAllAsRead(userId: string): Promise<Result<void>> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to mark all as read', error as Error)
      );
    }
  }

  async deleteOldReadNotifications(
    userId: string,
    daysOld: number
  ): Promise<Result<void>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true,
          readAt: {
            lt: cutoffDate,
          },
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to delete old notifications',
          error as Error
        )
      );
    }
  }

  async save(entity: Notification): Promise<Result<Notification>> {
    try {
      const model = notificationMapper.toPersistence(entity);

      const saved = await prisma.notification.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(notificationMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save notification', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.notification.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to delete notification', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.notification.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to check notification existence',
          error as Error
        )
      );
    }
  }
}
