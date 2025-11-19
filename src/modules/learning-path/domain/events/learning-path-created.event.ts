/**
 * Learning Path Created Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface LearningPathCreatedEventPayload {
  learningPathId: string
  title: string
  createdBy: string
}

export class LearningPathCreatedEvent extends DomainEvent<LearningPathCreatedEventPayload> {
  constructor(payload: LearningPathCreatedEventPayload) {
    super('learning-path.created', payload)
  }
}
