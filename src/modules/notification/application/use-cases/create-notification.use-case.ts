/**
 * Create Notification Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { Notification } from '../../domain/notification.entity';
import type { INotificationRepository } from '../../domain/notification.repository.interface';
import type { CreateNotificationDTO } from '../dtos';
import { NotificationType } from '../../domain/value-objects/notification-type';
import {
  type NotificationDTO,
  notificationMapper,
} from '../../infrastructure/notification.mapper';

interface CreateNotificationRequest {
  dto: CreateNotificationDTO;
}

export class CreateNotificationUseCase extends BaseUseCase<
  CreateNotificationRequest,
  NotificationDTO
> {
  constructor(private notificationRepository: INotificationRepository) {
    super();
  }

  async execute(
    request: CreateNotificationRequest
  ): Promise<Result<NotificationDTO>> {
    const { dto } = request;

    // Create NotificationType value object
    const typeResult = NotificationType.create(dto.type);
    if (typeResult.isFailure) {
      return Result.fail(typeResult.error);
    }

    // Create notification entity
    const notificationResult = Notification.create({
      userId: dto.userId,
      type: typeResult.value,
      title: dto.title,
      content: dto.content,
      link: dto.link,
      data: dto.data,
    });

    if (notificationResult.isFailure) {
      return Result.fail(notificationResult.error);
    }

    // Save to repository
    const savedResult = await this.notificationRepository.save(
      notificationResult.value
    );

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const notificationDTO = notificationMapper.toDTO(savedResult.value);

    return Result.ok(notificationDTO);
  }
}
