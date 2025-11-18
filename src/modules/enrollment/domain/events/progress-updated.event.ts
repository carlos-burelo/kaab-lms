/**
 * Progress Updated Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface ProgressUpdatedEventPayload {
  enrollmentId: string;
  userId: string;
  courseId: string;
  oldProgress: number;
  newProgress: number;
}

export class ProgressUpdatedEvent extends DomainEvent<ProgressUpdatedEventPayload> {
  constructor(payload: ProgressUpdatedEventPayload) {
    super('enrollment.progress-updated', payload);
  }
}
