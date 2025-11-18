/**
 * Message Repository Interface
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { Message } from './message.entity';

export interface IMessageRepository extends Repository<Message> {
  /**
   * Find messages by conversation ID
   */
  findByConversation(
    conversationId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<Message[]>>;

  /**
   * Find unread messages in a conversation for a specific user
   */
  findUnreadByConversationAndUser(
    conversationId: string,
    userId: string
  ): Promise<Result<Message[]>>;

  /**
   * Mark multiple messages as read
   */
  markManyAsRead(messageIds: string[]): Promise<Result<void>>;

  /**
   * Count unread messages in a conversation for a specific user
   */
  countUnreadByConversationAndUser(
    conversationId: string,
    userId: string
  ): Promise<Result<number>>;
}
