/**
 * Mark Messages As Read Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import type { IMessageRepository } from '../../domain/message.repository.interface';
import type { IConversationRepository } from '../../domain/conversation.repository.interface';

interface MarkMessagesAsReadRequest {
  conversationId: string;
  currentUserId: string;
}

export class MarkMessagesAsReadUseCase extends BaseUseCase<
  MarkMessagesAsReadRequest,
  void
> {
  constructor(
    private messageRepository: IMessageRepository,
    private conversationRepository: IConversationRepository
  ) {
    super();
  }

  async execute(request: MarkMessagesAsReadRequest): Promise<Result<void>> {
    const { conversationId, currentUserId } = request;

    // Find conversation
    const conversationResult = await this.conversationRepository.findById(
      conversationId
    );

    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.error);
    }

    if (!conversationResult.value) {
      return Result.fail(new NotFoundError('Conversation', conversationId));
    }

    const conversation = conversationResult.value;

    // Check if user is a participant
    if (!conversation.isParticipant(currentUserId)) {
      return Result.fail(
        new ForbiddenError('You are not a participant in this conversation')
      );
    }

    // Find unread messages for this user
    const unreadMessagesResult =
      await this.messageRepository.findUnreadByConversationAndUser(
        conversationId,
        currentUserId
      );

    if (unreadMessagesResult.isFailure) {
      return Result.fail(unreadMessagesResult.error);
    }

    const unreadMessages = unreadMessagesResult.value;

    // If no unread messages, return early
    if (unreadMessages.length === 0) {
      return Result.ok(undefined);
    }

    // Mark all messages as read
    const messageIds = unreadMessages.map((m) => m.id);
    const markAsReadResult = await this.messageRepository.markManyAsRead(
      messageIds
    );

    if (markAsReadResult.isFailure) {
      return Result.fail(markAsReadResult.error);
    }

    // Update conversation unread count
    const updateResult = conversation.markMessagesAsRead(currentUserId);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.error);
    }

    // Save updated conversation
    const savedConversationResult = await this.conversationRepository.save(
      conversation
    );

    if (savedConversationResult.isFailure) {
      return Result.fail(savedConversationResult.error);
    }

    return Result.ok(undefined);
  }
}
