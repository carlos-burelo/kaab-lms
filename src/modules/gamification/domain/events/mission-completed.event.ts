/**
 * Mission Completed Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface MissionCompletedEventPayload {
  missionId: string
  userId: string
  missionTitle: string
  xpReward: number
  coinReward: number
}

export class MissionCompletedEvent extends DomainEvent<MissionCompletedEventPayload> {
  constructor(payload: MissionCompletedEventPayload) {
    super('mission.completed', payload)
  }
}
