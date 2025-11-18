/**
 * Task Cancelled Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface TaskCancelledEventPayload {
  taskId: string;
  userId: string;
  title: string;
}

export class TaskCancelledEvent extends DomainEvent<TaskCancelledEventPayload> {
  constructor(payload: TaskCancelledEventPayload) {
    super('task.cancelled', payload);
  }
}
