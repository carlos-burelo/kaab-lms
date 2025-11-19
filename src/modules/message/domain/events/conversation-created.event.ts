/**
 * Conversation Created Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface ConversationCreatedEventPayload {
  conversationId: string
  participant1Id: string
  participant2Id: string
}

export class ConversationCreatedEvent extends DomainEvent<ConversationCreatedEventPayload> {
  constructor(payload: ConversationCreatedEventPayload) {
    super('conversation.created', payload)
  }
}
