/**
 * Message Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import { Message } from '../domain/message.entity';
import { IMessageRepository } from '../domain/message.repository.interface';
import { messageMapper } from './message.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class MessageRepository implements IMessageRepository {
  async findById(id: string): Promise<Result<Message | null>> {
    try {
      const message = await prisma.message.findUnique({
        where: { id },
      });

      if (!message) return Result.ok(null);

      return Result.ok(messageMapper.toDomain(message));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find message', error as Error)
      );
    }
  }

  async findByConversation(
    conversationId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<Message[]>> {
    try {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: options?.limit,
        skip: options?.offset,
      });

      const domainMessages = messages.map((m) => messageMapper.toDomain(m));

      return Result.ok(domainMessages);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find messages by conversation', error as Error)
      );
    }
  }

  async findUnreadByConversationAndUser(
    conversationId: string,
    userId: string
  ): Promise<Result<Message[]>> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversationId,
          isRead: false,
          senderId: {
            not: userId, // Only messages not sent by this user
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const domainMessages = messages.map((m) => messageMapper.toDomain(m));

      return Result.ok(domainMessages);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find unread messages', error as Error)
      );
    }
  }

  async markManyAsRead(messageIds: string[]): Promise<Result<void>> {
    try {
      await prisma.message.updateMany({
        where: {
          id: {
            in: messageIds,
          },
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to mark messages as read', error as Error)
      );
    }
  }

  async countUnreadByConversationAndUser(
    conversationId: string,
    userId: string
  ): Promise<Result<number>> {
    try {
      const count = await prisma.message.count({
        where: {
          conversationId,
          isRead: false,
          senderId: {
            not: userId,
          },
        },
      });

      return Result.ok(count);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to count unread messages', error as Error)
      );
    }
  }

  async save(entity: Message): Promise<Result<Message>> {
    try {
      const model = messageMapper.toPersistence(entity);

      const saved = await prisma.message.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(messageMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save message', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.message.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to delete message', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.message.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check message existence', error as Error)
      );
    }
  }
}
