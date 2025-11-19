/**
 * Notification Created Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface NotificationCreatedEventPayload {
  notificationId: string
  userId: string
  type: string
  title: string
}

export class NotificationCreatedEvent extends DomainEvent<NotificationCreatedEventPayload> {
  constructor(payload: NotificationCreatedEventPayload) {
    super('notification.created', payload)
  }
}
