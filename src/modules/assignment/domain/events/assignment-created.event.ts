/**
 * Assignment Created Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface AssignmentCreatedEventPayload {
  assignmentId: string
  lessonId: string
  title: string
  dueDate?: Date
}

export class AssignmentCreatedEvent extends DomainEvent<AssignmentCreatedEventPayload> {
  constructor(payload: AssignmentCreatedEventPayload) {
    super('assignment.created', payload)
  }
}
