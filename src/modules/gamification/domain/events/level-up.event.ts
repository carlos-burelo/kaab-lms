/**
 * Level Up Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface LevelUpEventPayload {
  userId: string
  previousLevel: number
  newLevel: number
  currentXp: number
}

export class LevelUpEvent extends DomainEvent<LevelUpEventPayload> {
  constructor(payload: LevelUpEventPayload) {
    super('user.levelup', payload)
  }
}
