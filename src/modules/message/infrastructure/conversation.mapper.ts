/**
 * Conversation Mapper
 */

import type { Mapper } from '@/core/shared/mapper.interface';
import { Conversation, type ConversationProps } from '../domain/conversation.entity';
import type { Conversation as PrismaConversation } from '@prisma/client';

export interface ConversationDTO {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessageId?: string;
  unreadCount1: number;
  unreadCount2: number;
  createdAt: Date;
  updatedAt: Date;
}

class ConversationMapper
  implements Mapper<Conversation, PrismaConversation, ConversationDTO>
{
  toDomain(raw: PrismaConversation): Conversation {
    const props: ConversationProps = {
      participant1Id: raw.participant1Id,
      participant2Id: raw.participant2Id,
      lastMessageId: raw.lastMessageId || undefined,
      unreadCount1: raw.unreadCount1,
      unreadCount2: raw.unreadCount2,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };

    // Use factory method instead of direct instantiation
    const result = Conversation.create(props);
    if (result.isFailure) {
      throw new Error(
        `Failed to create Conversation entity: ${result.error.message}`
      );
    }

    return result.value;
  }

  toPersistence(
    entity: Conversation
  ): Omit<PrismaConversation, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      participant1Id: entity.participant1Id,
      participant2Id: entity.participant2Id,
      lastMessageId: entity.lastMessageId || null,
      unreadCount1: entity.unreadCount1,
      unreadCount2: entity.unreadCount2,
    };
  }

  toDTO(entity: Conversation): ConversationDTO {
    return {
      id: entity.id,
      participant1Id: entity.participant1Id,
      participant2Id: entity.participant2Id,
      lastMessageId: entity.lastMessageId,
      unreadCount1: entity.unreadCount1,
      unreadCount2: entity.unreadCount2,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const conversationMapper = new ConversationMapper();
