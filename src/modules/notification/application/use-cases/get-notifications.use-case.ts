/**
 * Get Notifications Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import type { INotificationRepository } from '../../domain/notification.repository.interface';
import type { GetNotificationsDTO } from '../dtos';
import {
  type NotificationDTO,
  notificationMapper,
} from '../../infrastructure/notification.mapper';

interface GetNotificationsRequest {
  dto: GetNotificationsDTO;
}

export class GetNotificationsUseCase extends BaseUseCase<
  GetNotificationsRequest,
  NotificationDTO[]
> {
  constructor(private notificationRepository: INotificationRepository) {
    super();
  }

  async execute(
    request: GetNotificationsRequest
  ): Promise<Result<NotificationDTO[]>> {
    const { dto } = request;

    // Find notifications
    const notificationsResult = await this.notificationRepository.findByUserId(
      dto.userId,
      {
        limit: dto.limit,
        offset: dto.offset,
        isRead: dto.isRead,
        type: dto.type,
      }
    );

    if (notificationsResult.isFailure) {
      return Result.fail(notificationsResult.error);
    }

    // Map to DTOs
    const notificationDTOs = notificationsResult.value.map((notification) =>
      notificationMapper.toDTO(notification)
    );

    return Result.ok(notificationDTOs);
  }
}
