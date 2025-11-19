/**
 * Notification Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import {
  NotificationCreatedEvent,
  NotificationReadEvent,
} from './events';
import { type NotificationType, NotificationTypeEnum } from './value-objects/notification-type';

export interface NotificationProps extends EntityProps {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
}

export class Notification extends AggregateRoot<NotificationProps> {
  get userId(): string {
    return this._props.userId;
  }

  get type(): NotificationType {
    return this._props.type;
  }

  get title(): string {
    return this._props.title;
  }

  get content(): string {
    return this._props.content;
  }

  get link(): string | undefined {
    return this._props.link;
  }

  get data(): Record<string, unknown> | undefined {
    return this._props.data;
  }

  get isRead(): boolean {
    return this._props.isRead;
  }

  get readAt(): Date | undefined {
    return this._props.readAt;
  }

  private constructor(props: NotificationProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new notification
   */
  static create(
    props: Omit<NotificationProps, 'id' | 'isRead' | 'readAt' | 'createdAt' | 'updatedAt'>
  ): Result<Notification, ValidationError> {
    // Validations
    if (!props.userId || props.userId.trim().length === 0) {
      return Result.fail(
        new ValidationError('User ID is required', 'userId')
      );
    }

    if (!props.title || props.title.trim().length === 0) {
      return Result.fail(
        new ValidationError('Title is required', 'title')
      );
    }

    if (props.title.trim().length < 3) {
      return Result.fail(
        new ValidationError('Title must be at least 3 characters', 'title')
      );
    }

    if (!props.content || props.content.trim().length === 0) {
      return Result.fail(
        new ValidationError('Content is required', 'content')
      );
    }

    if (props.content.trim().length < 3) {
      return Result.fail(
        new ValidationError('Content must be at least 3 characters', 'content')
      );
    }

    const notification = new Notification(
      {
        ...props,
        isRead: false,
        readAt: undefined,
      },
      props.id
    );

    // Emit domain event
    notification.addDomainEvent(
      new NotificationCreatedEvent({
        notificationId: notification.id,
        userId: notification.userId,
        type: notification.type.value,
        title: notification.title,
      })
    );

    return Result.ok(notification);
  }

  /**
   * Mark notification as read
   */
  markAsRead(): Result<void, BusinessRuleError> {
    if (this._props.isRead) {
      return Result.fail(
        new BusinessRuleError('Notification is already marked as read')
      );
    }

    this._props.isRead = true;
    this._props.readAt = new Date();
    this.touch();

    // Emit domain event
    this.addDomainEvent(
      new NotificationReadEvent({
        notificationId: this.id,
        userId: this.userId,
        readAt: this._props.readAt,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Mark notification as unread
   */
  markAsUnread(): Result<void, BusinessRuleError> {
    if (!this._props.isRead) {
      return Result.fail(
        new BusinessRuleError('Notification is already marked as unread')
      );
    }

    this._props.isRead = false;
    this._props.readAt = undefined;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Check if notification can be deleted by a user
   */
  canBeDeletedBy(userId: string): boolean {
    return this._props.userId === userId;
  }

  toObject(): NotificationProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      content: this.content,
      link: this.link,
      data: this.data,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): Notification {
    return new Notification({ ...this._props }, this._id);
  }
}
