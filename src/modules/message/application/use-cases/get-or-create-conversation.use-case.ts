/**
 * Get Or Create Conversation Use Case
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { Conversation } from '../../domain/conversation.entity'
import type { IConversationRepository } from '../../domain/conversation.repository.interface'
import { type ConversationDTO, conversationMapper } from '../../infrastructure/conversation.mapper'
import type { CreateConversationDTO } from '../dtos'

interface GetOrCreateConversationRequest {
  dto: CreateConversationDTO
  currentUserId: string
}

export class GetOrCreateConversationUseCase extends BaseUseCase<GetOrCreateConversationRequest, ConversationDTO> {
  constructor(private conversationRepository: IConversationRepository) {
    super()
  }

  async execute(request: GetOrCreateConversationRequest): Promise<Result<ConversationDTO>> {
    const { dto, currentUserId } = request

    // Check if conversation already exists
    const existingConversationResult = await this.conversationRepository.findByParticipants(currentUserId, dto.participant2Id)

    if (existingConversationResult.isFailure) {
      return Result.fail(existingConversationResult.error)
    }

    // If conversation exists, return it
    if (existingConversationResult.value) {
      const conversationDTO = conversationMapper.toDTO(existingConversationResult.value)
      return Result.ok(conversationDTO)
    }

    // Create new conversation
    const conversationResult = Conversation.create({
      participant1Id: currentUserId,
      participant2Id: dto.participant2Id
    })

    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.error)
    }

    // Save to repository
    const savedResult = await this.conversationRepository.save(conversationResult.value)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const conversationDTO = conversationMapper.toDTO(savedResult.value)

    return Result.ok(conversationDTO)
  }
}
