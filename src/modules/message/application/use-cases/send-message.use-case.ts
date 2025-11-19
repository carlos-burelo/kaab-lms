/**
 * Send Message Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import { Message } from '../../domain/message.entity';
import type { IMessageRepository } from '../../domain/message.repository.interface';
import type { IConversationRepository } from '../../domain/conversation.repository.interface';
import type { SendMessageDTO } from '../dtos';
import { type MessageDTO, messageMapper } from '../../infrastructure/message.mapper';

interface SendMessageRequest {
  dto: SendMessageDTO;
  currentUserId: string;
}

export class SendMessageUseCase extends BaseUseCase<
  SendMessageRequest,
  MessageDTO
> {
  constructor(
    private messageRepository: IMessageRepository,
    private conversationRepository: IConversationRepository
  ) {
    super();
  }

  async execute(request: SendMessageRequest): Promise<Result<MessageDTO>> {
    const { dto, currentUserId } = request;

    // Find conversation
    const conversationResult = await this.conversationRepository.findById(
      dto.conversationId
    );

    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.error);
    }

    if (!conversationResult.value) {
      return Result.fail(new NotFoundError('Conversation', dto.conversationId));
    }

    const conversation = conversationResult.value;

    // Check if user is a participant
    if (!conversation.isParticipant(currentUserId)) {
      return Result.fail(
        new ForbiddenError('You are not a participant in this conversation')
      );
    }

    // Create message entity
    const messageResult = Message.create({
      conversationId: dto.conversationId,
      senderId: currentUserId,
      content: dto.content,
    });

    if (messageResult.isFailure) {
      return Result.fail(messageResult.error);
    }

    const message = messageResult.value;

    // Update conversation
    const updateResult = conversation.sendMessage(message);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.error);
    }

    // Save message
    const savedMessageResult = await this.messageRepository.save(message);

    if (savedMessageResult.isFailure) {
      return Result.fail(savedMessageResult.error);
    }

    // Save updated conversation
    const savedConversationResult = await this.conversationRepository.save(
      conversation
    );

    if (savedConversationResult.isFailure) {
      return Result.fail(savedConversationResult.error);
    }

    // Map to DTO
    const messageDTO = messageMapper.toDTO(savedMessageResult.value);

    return Result.ok(messageDTO);
  }
}
