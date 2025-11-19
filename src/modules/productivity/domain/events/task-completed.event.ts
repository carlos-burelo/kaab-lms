/**
 * Task Completed Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface TaskCompletedEventPayload {
  taskId: string
  userId: string
  title: string
  completedAt: Date
}

export class TaskCompletedEvent extends DomainEvent<TaskCompletedEventPayload> {
  constructor(payload: TaskCompletedEventPayload) {
    super('task.completed', payload)
  }
}
