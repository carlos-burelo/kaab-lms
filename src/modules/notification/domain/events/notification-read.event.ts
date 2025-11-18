/**
 * Notification Read Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface NotificationReadEventPayload {
  notificationId: string;
  userId: string;
  readAt: Date;
}

export class NotificationReadEvent extends DomainEvent<NotificationReadEventPayload> {
  constructor(payload: NotificationReadEventPayload) {
    super('notification.read', payload);
  }
}
