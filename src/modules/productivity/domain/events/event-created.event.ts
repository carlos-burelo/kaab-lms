/**
 * Calendar Event Created Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';
import type { EventType } from '../value-objects';

export interface EventCreatedEventPayload {
  eventId: string;
  userId: string;
  title: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
}

export class EventCreatedEvent extends DomainEvent<EventCreatedEventPayload> {
  constructor(payload: EventCreatedEventPayload) {
    super('calendarEvent.created', payload);
  }
}
