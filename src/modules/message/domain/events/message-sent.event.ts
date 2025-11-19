/**
 * Message Sent Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface MessageSentEventPayload {
  messageId: string
  conversationId: string
  senderId: string
  content: string
}

export class MessageSentEvent extends DomainEvent<MessageSentEventPayload> {
  constructor(payload: MessageSentEventPayload) {
    super('message.sent', payload)
  }
}
