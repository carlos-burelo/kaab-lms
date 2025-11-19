/**
 * Get Conversations Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import type { IConversationRepository } from '../../domain/conversation.repository.interface';
import {
  type ConversationDTO,
  conversationMapper,
} from '../../infrastructure/conversation.mapper';

interface GetConversationsRequest {
  currentUserId: string;
  limit?: number;
  offset?: number;
}

interface GetConversationsResponse {
  conversations: ConversationDTO[];
  totalUnreadCount: number;
}

export class GetConversationsUseCase extends BaseUseCase<
  GetConversationsRequest,
  GetConversationsResponse
> {
  constructor(private conversationRepository: IConversationRepository) {
    super();
  }

  async execute(
    request: GetConversationsRequest
  ): Promise<Result<GetConversationsResponse>> {
    const { currentUserId, limit, offset } = request;

    // Find all conversations for user
    const conversationsResult = await this.conversationRepository.findByUser(
      currentUserId,
      {
        limit,
        offset,
      }
    );

    if (conversationsResult.isFailure) {
      return Result.fail(conversationsResult.error);
    }

    // Get total unread count
    const totalUnreadResult = await this.conversationRepository.getTotalUnreadCount(
      currentUserId
    );

    if (totalUnreadResult.isFailure) {
      return Result.fail(totalUnreadResult.error);
    }

    // Map to DTOs
    const conversationDTOs = conversationsResult.value.map((c) =>
      conversationMapper.toDTO(c)
    );

    return Result.ok({
      conversations: conversationDTOs,
      totalUnreadCount: totalUnreadResult.value,
    });
  }
}
