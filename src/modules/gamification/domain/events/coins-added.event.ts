/**
 * Coins Added Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface CoinsAddedEventPayload {
  userId: string;
  amount: number;
  reason: string;
  totalCoins: number;
}

export class CoinsAddedEvent extends DomainEvent<CoinsAddedEventPayload> {
  constructor(payload: CoinsAddedEventPayload) {
    super('user.coinsadded', payload);
  }
}
