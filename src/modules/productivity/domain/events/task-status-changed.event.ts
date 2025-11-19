/**
 * Task Status Changed Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';
import type { TaskStatus } from '../value-objects';

export interface TaskStatusChangedEventPayload {
  taskId: string;
  userId: string;
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
}

export class TaskStatusChangedEvent extends DomainEvent<TaskStatusChangedEventPayload> {
  constructor(payload: TaskStatusChangedEventPayload) {
    super('task.statusChanged', payload);
  }
}
