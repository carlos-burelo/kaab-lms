/**
 * Conversation Repository Interface
 */

import type { Repository } from '@/core/shared/repository.interface'
import type { Result } from '@/core/shared/result'
import type { Conversation } from './conversation.entity'

export interface IConversationRepository extends Repository<Conversation> {
  /**
   * Find conversation between two participants
   */
  findByParticipants(participant1Id: string, participant2Id: string): Promise<Result<Conversation | null>>

  /**
   * Find all conversations for a user
   */
  findByUser(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<Result<Conversation[]>>

  /**
   * Get conversation with messages
   */
  findByIdWithMessages(
    id: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<Result<Conversation | null>>

  /**
   * Get total unread count for a user across all conversations
   */
  getTotalUnreadCount(userId: string): Promise<Result<number>>
}
