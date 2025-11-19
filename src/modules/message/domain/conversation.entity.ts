/**
 * Conversation Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root'
import { BusinessRuleError, ValidationError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { ConversationCreatedEvent } from './events'
import type { Message } from './message.entity'

export interface ConversationProps extends EntityProps {
  participant1Id: string
  participant2Id: string
  lastMessageId?: string
  unreadCount1: number
  unreadCount2: number
}

export class Conversation extends AggregateRoot<ConversationProps> {
  get participant1Id(): string {
    return this._props.participant1Id
  }

  get participant2Id(): string {
    return this._props.participant2Id
  }

  get lastMessageId(): string | undefined {
    return this._props.lastMessageId
  }

  get unreadCount1(): number {
    return this._props.unreadCount1
  }

  get unreadCount2(): number {
    return this._props.unreadCount2
  }

  private constructor(props: ConversationProps, id?: string) {
    super(props, id)
  }

  /**
   * Create a new conversation
   */
  static create(
    props: Omit<ConversationProps, 'id' | 'lastMessageId' | 'unreadCount1' | 'unreadCount2' | 'createdAt' | 'updatedAt'>
  ): Result<Conversation, ValidationError> {
    // Validations
    if (!props.participant1Id || props.participant1Id.trim().length === 0) {
      return Result.fail(new ValidationError('Participant 1 ID is required', 'participant1Id'))
    }

    if (!props.participant2Id || props.participant2Id.trim().length === 0) {
      return Result.fail(new ValidationError('Participant 2 ID is required', 'participant2Id'))
    }

    if (props.participant1Id === props.participant2Id) {
      return Result.fail(new ValidationError('Participants must be different users', 'participant2Id'))
    }

    const conversation = new Conversation(
      {
        ...props,
        lastMessageId: undefined,
        unreadCount1: 0,
        unreadCount2: 0
      },
      props.id
    )

    // Emit domain event
    conversation.addDomainEvent(
      new ConversationCreatedEvent({
        conversationId: conversation.id,
        participant1Id: conversation.participant1Id,
        participant2Id: conversation.participant2Id
      })
    )

    return Result.ok(conversation)
  }

  /**
   * Send a message in this conversation
   */
  sendMessage(message: Message): Result<void, BusinessRuleError> {
    // Validate that the sender is a participant
    if (message.senderId !== this.participant1Id && message.senderId !== this.participant2Id) {
      return Result.fail(new BusinessRuleError('Sender must be a participant in the conversation'))
    }

    // Update last message
    this._props.lastMessageId = message.id

    // Increment unread count for the other participant
    if (message.senderId === this.participant1Id) {
      this._props.unreadCount2++
    } else {
      this._props.unreadCount1++
    }

    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Mark messages as read for a participant
   */
  markMessagesAsRead(userId: string): Result<void, ValidationError> {
    if (userId !== this.participant1Id && userId !== this.participant2Id) {
      return Result.fail(new ValidationError('User is not a participant in this conversation', 'userId'))
    }

    // Reset unread count for the user
    if (userId === this.participant1Id) {
      this._props.unreadCount1 = 0
    } else {
      this._props.unreadCount2 = 0
    }

    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Get unread count for a specific participant
   */
  getUnreadCount(userId: string): number {
    if (userId === this.participant1Id) {
      return this.unreadCount1
    } else if (userId === this.participant2Id) {
      return this.unreadCount2
    }
    return 0
  }

  /**
   * Get the other participant in the conversation
   */
  getOtherParticipant(userId: string): string | null {
    if (userId === this.participant1Id) {
      return this.participant2Id
    } else if (userId === this.participant2Id) {
      return this.participant1Id
    }
    return null
  }

  /**
   * Check if user is a participant
   */
  isParticipant(userId: string): boolean {
    return userId === this.participant1Id || userId === this.participant2Id
  }

  toObject(): ConversationProps & {
    id: string
    createdAt: Date
    updatedAt: Date
  } {
    return {
      id: this.id,
      participant1Id: this.participant1Id,
      participant2Id: this.participant2Id,
      lastMessageId: this.lastMessageId,
      unreadCount1: this.unreadCount1,
      unreadCount2: this.unreadCount2,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  clone(): Conversation {
    return new Conversation({ ...this._props }, this._id)
  }
}
