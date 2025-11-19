/**
 * Notification Mapper
 */

import type { Mapper } from '@/core/shared/mapper.interface';
import { Notification, type NotificationProps } from '../domain/notification.entity';
import { NotificationType, type NotificationTypeEnum } from '../domain/value-objects/notification-type';
import type { Notification as PrismaNotification } from '@prisma/client';

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationTypeEnum;
  title: string;
  content: string;
  link?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class NotificationMapper
  implements Mapper<Notification, PrismaNotification, NotificationDTO>
{
  toDomain(raw: PrismaNotification): Notification {
    // Create NotificationType value object
    const typeResult = NotificationType.create(raw.type);
    if (typeResult.isFailure) {
      throw new Error(
        `Failed to create NotificationType: ${typeResult.error.message}`
      );
    }

    const props: NotificationProps = {
      userId: raw.userId,
      type: typeResult.value,
      title: raw.title,
      content: raw.message, // Note: Prisma uses 'message', domain uses 'content'
      link: raw.link || undefined,
      data: (raw.data as Record<string, unknown>) || undefined,
      isRead: raw.isRead,
      readAt: raw.readAt || undefined,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt, // Prisma schema doesn't have updatedAt
    };

    // Use factory method
    const result = Notification.create(props);
    if (result.isFailure) {
      throw new Error(
        `Failed to create Notification entity: ${result.error.message}`
      );
    }

    return result.value;
  }

  toPersistence(
    entity: Notification
  ): Omit<PrismaNotification, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type.value as any, // Prisma enum
      title: entity.title,
      message: entity.content, // Note: Prisma uses 'message', domain uses 'content'
      link: entity.link || null,
      data: entity.data ? (entity.data as any) : null,
      isRead: entity.isRead,
      readAt: entity.readAt || null,
    };
  }

  toDTO(entity: Notification): NotificationDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type.value,
      title: entity.title,
      content: entity.content,
      link: entity.link,
      data: entity.data,
      isRead: entity.isRead,
      readAt: entity.readAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const notificationMapper = new NotificationMapper();
