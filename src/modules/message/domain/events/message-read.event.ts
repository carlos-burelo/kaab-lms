/**
 * Message Read Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface MessageReadEventPayload {
  messageId: string;
  conversationId: string;
  readAt: Date;
}

export class MessageReadEvent extends DomainEvent<MessageReadEventPayload> {
  constructor(payload: MessageReadEventPayload) {
    super('message.read', payload);
  }
}
