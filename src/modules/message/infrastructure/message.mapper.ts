/**
 * Message Mapper
 */

import { Mapper } from '@/core/shared/mapper.interface';
import { Message, MessageProps } from '../domain/message.entity';
import type { Message as PrismaMessage } from '@prisma/client';

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class MessageMapper implements Mapper<Message, PrismaMessage, MessageDTO> {
  toDomain(raw: PrismaMessage): Message {
    const props: MessageProps = {
      conversationId: raw.conversationId,
      senderId: raw.senderId,
      content: raw.content,
      isRead: raw.isRead,
      readAt: raw.readAt || undefined,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt, // Prisma Message doesn't have updatedAt, using createdAt
    };

    // Use factory method instead of direct instantiation
    const result = Message.create(props);
    if (result.isFailure) {
      throw new Error(`Failed to create Message entity: ${result.error.message}`);
    }

    return result.value;
  }

  toPersistence(entity: Message): Omit<PrismaMessage, 'createdAt'> {
    return {
      id: entity.id,
      conversationId: entity.conversationId,
      senderId: entity.senderId,
      content: entity.content,
      isRead: entity.isRead,
      readAt: entity.readAt || null,
    };
  }

  toDTO(entity: Message): MessageDTO {
    return {
      id: entity.id,
      conversationId: entity.conversationId,
      senderId: entity.senderId,
      content: entity.content,
      isRead: entity.isRead,
      readAt: entity.readAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const messageMapper = new MessageMapper();
