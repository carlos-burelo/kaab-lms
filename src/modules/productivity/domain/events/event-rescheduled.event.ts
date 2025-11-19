/**
 * Calendar Event Rescheduled Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface EventRescheduledEventPayload {
  eventId: string
  userId: string
  title: string
  previousStartDate: Date
  previousEndDate: Date
  newStartDate: Date
  newEndDate: Date
}

export class EventRescheduledEvent extends DomainEvent<EventRescheduledEventPayload> {
  constructor(payload: EventRescheduledEventPayload) {
    super('calendarEvent.rescheduled', payload)
  }
}
