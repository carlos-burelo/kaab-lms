/**
 * Conversation Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import type { Conversation } from '../domain/conversation.entity';
import type { IConversationRepository } from '../domain/conversation.repository.interface';
import { conversationMapper } from './conversation.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class ConversationRepository implements IConversationRepository {
  async findById(id: string): Promise<Result<Conversation | null>> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
      });

      if (!conversation) return Result.ok(null);

      return Result.ok(conversationMapper.toDomain(conversation));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find conversation', error as Error)
      );
    }
  }

  async findByParticipants(
    participant1Id: string,
    participant2Id: string
  ): Promise<Result<Conversation | null>> {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            {
              participant1Id: participant1Id,
              participant2Id: participant2Id,
            },
            {
              participant1Id: participant2Id,
              participant2Id: participant1Id,
            },
          ],
        },
      });

      if (!conversation) return Result.ok(null);

      return Result.ok(conversationMapper.toDomain(conversation));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find conversation by participants', error as Error)
      );
    }
  }

  async findByUser(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<Conversation[]>> {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [{ participant1Id: userId }, { participant2Id: userId }],
        },
        orderBy: { updatedAt: 'desc' },
        take: options?.limit,
        skip: options?.offset,
      });

      const domainConversations = conversations.map((c) =>
        conversationMapper.toDomain(c)
      );

      return Result.ok(domainConversations);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find conversations by user', error as Error)
      );
    }
  }

  async findByIdWithMessages(
    id: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<Conversation | null>> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: options?.limit,
            skip: options?.offset,
          },
        },
      });

      if (!conversation) return Result.ok(null);

      return Result.ok(conversationMapper.toDomain(conversation));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find conversation with messages', error as Error)
      );
    }
  }

  async getTotalUnreadCount(userId: string): Promise<Result<number>> {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [{ participant1Id: userId }, { participant2Id: userId }],
        },
        select: {
          participant1Id: true,
          participant2Id: true,
          unreadCount1: true,
          unreadCount2: true,
        },
      });

      const totalUnread = conversations.reduce((sum, conv) => {
        if (conv.participant1Id === userId) {
          return sum + conv.unreadCount1;
        } else {
          return sum + conv.unreadCount2;
        }
      }, 0);

      return Result.ok(totalUnread);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get total unread count', error as Error)
      );
    }
  }

  async save(entity: Conversation): Promise<Result<Conversation>> {
    try {
      const model = conversationMapper.toPersistence(entity);

      const saved = await prisma.conversation.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(conversationMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save conversation', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.conversation.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to delete conversation', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.conversation.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check conversation existence', error as Error)
      );
    }
  }
}
