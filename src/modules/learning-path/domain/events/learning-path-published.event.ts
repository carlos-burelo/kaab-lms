/**
 * Learning Path Published Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface LearningPathPublishedEventPayload {
  learningPathId: string
  title: string
  createdBy: string
}

export class LearningPathPublishedEvent extends DomainEvent<LearningPathPublishedEventPayload> {
  constructor(payload: LearningPathPublishedEventPayload) {
    super('learning-path.published', payload)
  }
}
