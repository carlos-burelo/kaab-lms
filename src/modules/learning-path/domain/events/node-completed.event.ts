/**
 * Node Completed Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface NodeCompletedEventPayload {
  userId: string
  learningPathId: string
  nodeId: string
  courseId?: string
}

export class NodeCompletedEvent extends DomainEvent<NodeCompletedEventPayload> {
  constructor(payload: NodeCompletedEventPayload) {
    super('learning-path.node-completed', payload)
  }
}
