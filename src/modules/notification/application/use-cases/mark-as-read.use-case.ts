/**
 * Mark Notification As Read Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import { INotificationRepository } from '../../domain/notification.repository.interface';
import {
  NotificationDTO,
  notificationMapper,
} from '../../infrastructure/notification.mapper';

interface MarkAsReadRequest {
  notificationId: string;
  currentUserId: string;
}

export class MarkAsReadUseCase extends BaseUseCase<
  MarkAsReadRequest,
  NotificationDTO
> {
  constructor(private notificationRepository: INotificationRepository) {
    super();
  }

  async execute(request: MarkAsReadRequest): Promise<Result<NotificationDTO>> {
    const { notificationId, currentUserId } = request;

    // Find notification
    const notificationResult = await this.notificationRepository.findById(
      notificationId
    );

    if (notificationResult.isFailure) {
      return Result.fail(notificationResult.error);
    }

    if (!notificationResult.value) {
      return Result.fail(
        new NotFoundError('Notification', 'id', notificationId)
      );
    }

    const notification = notificationResult.value;

    // Check if user owns the notification
    if (notification.userId !== currentUserId) {
      return Result.fail(
        new ForbiddenError('You can only mark your own notifications as read')
      );
    }

    // Mark as read
    const markResult = notification.markAsRead();
    if (markResult.isFailure) {
      return Result.fail(markResult.error);
    }

    // Save to repository
    const savedResult = await this.notificationRepository.save(notification);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const notificationDTO = notificationMapper.toDTO(savedResult.value);

    return Result.ok(notificationDTO);
  }
}
