/**
 * Learning Path Completed Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface LearningPathCompletedEventPayload {
  userId: string
  learningPathId: string
  completedAt: Date
}

export class LearningPathCompletedEvent extends DomainEvent<LearningPathCompletedEventPayload> {
  constructor(payload: LearningPathCompletedEventPayload) {
    super('learning-path.completed', payload)
  }
}
