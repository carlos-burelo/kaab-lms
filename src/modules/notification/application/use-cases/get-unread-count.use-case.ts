/**
 * Get Unread Count Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { INotificationRepository } from '../../domain/notification.repository.interface';

interface GetUnreadCountRequest {
  userId: string;
}

export class GetUnreadCountUseCase extends BaseUseCase<
  GetUnreadCountRequest,
  number
> {
  constructor(private notificationRepository: INotificationRepository) {
    super();
  }

  async execute(request: GetUnreadCountRequest): Promise<Result<number>> {
    const { userId } = request;

    // Get unread count
    const countResult = await this.notificationRepository.getUnreadCount(
      userId
    );

    if (countResult.isFailure) {
      return Result.fail(countResult.error);
    }

    return Result.ok(countResult.value);
  }
}
