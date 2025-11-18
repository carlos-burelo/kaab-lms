/**
 * Assignment Submitted Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface AssignmentSubmittedEventPayload {
  assignmentId: string;
  userId: string;
  content?: string;
  fileId?: string;
  submittedAt: Date;
}

export class AssignmentSubmittedEvent extends DomainEvent<AssignmentSubmittedEventPayload> {
  constructor(payload: AssignmentSubmittedEventPayload) {
    super('assignment.submitted', payload);
  }
}
