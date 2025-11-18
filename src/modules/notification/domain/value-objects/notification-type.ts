/**
 * Notification Type Value Object
 */

import { ValueObject } from '@/core/shared/value-object';
import { Result } from '@/core/shared/result';
import { ValidationError } from '@/core/shared/errors';

export enum NotificationTypeEnum {
  SYSTEM = 'SYSTEM',
  COURSE = 'COURSE',
  MESSAGE = 'MESSAGE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  BADGE = 'BADGE',
  MISSION = 'MISSION',
  PAYMENT = 'PAYMENT',
  REMINDER = 'REMINDER',
  SOCIAL = 'SOCIAL',
}

interface NotificationTypeProps {
  value: NotificationTypeEnum;
}

export class NotificationType extends ValueObject<NotificationTypeProps> {
  get value(): NotificationTypeEnum {
    return this.props.value;
  }

  private constructor(props: NotificationTypeProps) {
    super(props);
  }

  public static create(
    type: string
  ): Result<NotificationType, ValidationError> {
    if (!type) {
      return Result.fail(
        new ValidationError('Notification type is required', 'type')
      );
    }

    const upperType = type.toUpperCase();

    if (!Object.values(NotificationTypeEnum).includes(upperType as NotificationTypeEnum)) {
      return Result.fail(
        new ValidationError(
          `Invalid notification type: ${type}. Must be one of: ${Object.values(NotificationTypeEnum).join(', ')}`,
          'type'
        )
      );
    }

    return Result.ok(
      new NotificationType({ value: upperType as NotificationTypeEnum })
    );
  }

  public static fromEnum(
    type: NotificationTypeEnum
  ): Result<NotificationType, ValidationError> {
    return NotificationType.create(type);
  }

  public equals(other: NotificationType): boolean {
    if (!(other instanceof NotificationType)) {
      return false;
    }
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
