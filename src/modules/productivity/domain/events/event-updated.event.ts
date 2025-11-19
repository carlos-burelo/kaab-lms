/**
 * Calendar Event Updated Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface EventUpdatedEventPayload {
  eventId: string
  userId: string
  title: string
}

export class EventUpdatedEvent extends DomainEvent<EventUpdatedEventPayload> {
  constructor(payload: EventUpdatedEventPayload) {
    super('calendarEvent.updated', payload)
  }
}
