/**
 * Assignment Graded Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface AssignmentGradedEventPayload {
  assignmentId: string
  submissionId: string
  score: number
  feedback?: string
  gradedAt: Date
}

export class AssignmentGradedEvent extends DomainEvent<AssignmentGradedEventPayload> {
  constructor(payload: AssignmentGradedEventPayload) {
    super('assignment.graded', payload)
  }
}
