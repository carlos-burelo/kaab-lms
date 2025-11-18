/**
 * Message Aggregate Root
 */

import { AggregateRoot, EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import { MessageSentEvent, MessageReadEvent } from './events';

export interface MessageProps extends EntityProps {
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
}

export class Message extends AggregateRoot<MessageProps> {
  get conversationId(): string {
    return this._props.conversationId;
  }

  get senderId(): string {
    return this._props.senderId;
  }

  get content(): string {
    return this._props.content;
  }

  get isRead(): boolean {
    return this._props.isRead;
  }

  get readAt(): Date | undefined {
    return this._props.readAt;
  }

  private constructor(props: MessageProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new message
   */
  static create(
    props: Omit<MessageProps, 'id' | 'isRead' | 'readAt' | 'createdAt' | 'updatedAt'>
  ): Result<Message, ValidationError> {
    // Validations
    if (!props.conversationId || props.conversationId.trim().length === 0) {
      return Result.fail(
        new ValidationError('Conversation ID is required', 'conversationId')
      );
    }

    if (!props.senderId || props.senderId.trim().length === 0) {
      return Result.fail(
        new ValidationError('Sender ID is required', 'senderId')
      );
    }

    if (!props.content || props.content.trim().length === 0) {
      return Result.fail(
        new ValidationError('Message content is required', 'content')
      );
    }

    if (props.content.trim().length > 10000) {
      return Result.fail(
        new ValidationError(
          'Message content must not exceed 10000 characters',
          'content'
        )
      );
    }

    const message = new Message(
      {
        ...props,
        isRead: false,
        readAt: undefined,
      },
      props.id
    );

    // Emit domain event
    message.addDomainEvent(
      new MessageSentEvent({
        messageId: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
      })
    );

    return Result.ok(message);
  }

  /**
   * Mark message as read
   */
  markAsRead(): Result<void, BusinessRuleError> {
    if (this._props.isRead) {
      return Result.fail(
        new BusinessRuleError('Message is already marked as read')
      );
    }

    this._props.isRead = true;
    this._props.readAt = new Date();
    this.touch();

    // Emit domain event
    this.addDomainEvent(
      new MessageReadEvent({
        messageId: this.id,
        conversationId: this.conversationId,
        readAt: this._props.readAt,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Check if message can be edited by a user
   */
  canBeEditedBy(userId: string): boolean {
    return this.senderId === userId;
  }

  toObject(): MessageProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      content: this.content,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): Message {
    return new Message({ ...this._props }, this._id);
  }
}
