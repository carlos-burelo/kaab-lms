/**
 * XP Added Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface XpAddedEventPayload {
  userId: string;
  amount: number;
  reason: string;
  totalXp: number;
}

export class XpAddedEvent extends DomainEvent<XpAddedEventPayload> {
  constructor(payload: XpAddedEventPayload) {
    super('user.xpadded', payload);
  }
}
