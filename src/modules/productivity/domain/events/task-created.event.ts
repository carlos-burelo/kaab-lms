/**
 * Task Created Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'
import type { TaskPriority } from '../value-objects'

export interface TaskCreatedEventPayload {
  taskId: string
  userId: string
  title: string
  priority: TaskPriority
  dueDate?: Date
}

export class TaskCreatedEvent extends DomainEvent<TaskCreatedEventPayload> {
  constructor(payload: TaskCreatedEventPayload) {
    super('task.created', payload)
  }
}
