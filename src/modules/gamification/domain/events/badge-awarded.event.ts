/**
 * Badge Awarded Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface BadgeAwardedEventPayload {
  badgeId: string;
  userId: string;
  badgeName: string;
}

export class BadgeAwardedEvent extends DomainEvent<BadgeAwardedEventPayload> {
  constructor(payload: BadgeAwardedEventPayload) {
    super('badge.awarded', payload);
  }
}
