/**
 * Notification Repository Interface
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { Notification } from './notification.entity';
import { NotificationTypeEnum } from './value-objects/notification-type';

export interface INotificationRepository extends Repository<Notification> {
  /**
   * Find all notifications for a user
   */
  findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      isRead?: boolean;
      type?: NotificationTypeEnum;
    }
  ): Promise<Result<Notification[]>>;

  /**
   * Get unread count for a user
   */
  getUnreadCount(userId: string): Promise<Result<number>>;

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): Promise<Result<void>>;

  /**
   * Delete old read notifications
   */
  deleteOldReadNotifications(
    userId: string,
    daysOld: number
  ): Promise<Result<void>>;
}
