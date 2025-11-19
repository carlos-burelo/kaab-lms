/**
 * Get Conversation Use Case
 */

import { ForbiddenError, NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IConversationRepository } from '../../domain/conversation.repository.interface'
import type { IMessageRepository } from '../../domain/message.repository.interface'
import { type ConversationDTO, conversationMapper } from '../../infrastructure/conversation.mapper'
import { type MessageDTO, messageMapper } from '../../infrastructure/message.mapper'

interface GetConversationRequest {
  conversationId: string
  currentUserId: string
  messagesLimit?: number
  messagesOffset?: number
}

interface GetConversationResponse {
  conversation: ConversationDTO
  messages: MessageDTO[]
}

export class GetConversationUseCase extends BaseUseCase<GetConversationRequest, GetConversationResponse> {
  constructor(
    private conversationRepository: IConversationRepository,
    private messageRepository: IMessageRepository
  ) {
    super()
  }

  async execute(request: GetConversationRequest): Promise<Result<GetConversationResponse>> {
    const { conversationId, currentUserId, messagesLimit, messagesOffset } = request

    // Find conversation
    const conversationResult = await this.conversationRepository.findById(conversationId)

    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.error)
    }

    if (!conversationResult.value) {
      return Result.fail(new NotFoundError('Conversation', conversationId))
    }

    const conversation = conversationResult.value

    // Check if user is a participant
    if (!conversation.isParticipant(currentUserId)) {
      return Result.fail(new ForbiddenError('You are not a participant in this conversation'))
    }

    // Get messages
    const messagesResult = await this.messageRepository.findByConversation(conversationId, {
      limit: messagesLimit,
      offset: messagesOffset
    })

    if (messagesResult.isFailure) {
      return Result.fail(messagesResult.error)
    }

    // Map to DTOs
    const conversationDTO = conversationMapper.toDTO(conversation)
    const messageDTOs = messagesResult.value.map((m) => messageMapper.toDTO(m))

    return Result.ok({
      conversation: conversationDTO,
      messages: messageDTOs
    })
  }
}
