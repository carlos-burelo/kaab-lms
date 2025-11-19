/**
 * Update Quiz Use Case
 */

import { EntityNotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IQuizRepository } from '../../domain/quiz.repository.interface'
import { type QuizDTO, quizMapper } from '../../infrastructure/quiz.mapper'
import type { UpdateQuizDTO } from '../dtos'

interface UpdateQuizRequest {
  dto: UpdateQuizDTO
  currentUserId: string
}

export class UpdateQuizUseCase extends BaseUseCase<UpdateQuizRequest, QuizDTO> {
  constructor(private quizRepository: IQuizRepository) {
    super()
  }

  async execute(request: UpdateQuizRequest): Promise<Result<QuizDTO>> {
    const { dto } = request

    // Find quiz
    const quizResult = await this.quizRepository.findById(dto.id)

    if (quizResult.isFailure) {
      return Result.fail(quizResult.error)
    }

    if (!quizResult.value) {
      return Result.fail(new EntityNotFoundError('Quiz', dto.id))
    }

    const quiz = quizResult.value

    // Update quiz properties
    if (dto.title) {
      const titleResult = quiz.updateTitle(dto.title)
      if (titleResult.isFailure) {
        return Result.fail(titleResult.error)
      }
    }

    if (dto.description !== undefined) {
      quiz.updateDescription(dto.description)
    }

    if (dto.instructions !== undefined) {
      quiz.updateInstructions(dto.instructions)
    }

    if (dto.passingScore !== undefined) {
      const scoreResult = quiz.updatePassingScore(dto.passingScore)
      if (scoreResult.isFailure) {
        return Result.fail(scoreResult.error)
      }
    }

    if (dto.durationMinutes !== undefined) {
      const durationResult = quiz.updateDuration(dto.durationMinutes)
      if (durationResult.isFailure) {
        return Result.fail(durationResult.error)
      }
    }

    if (dto.maxAttempts !== undefined) {
      const attemptsResult = quiz.updateMaxAttempts(dto.maxAttempts)
      if (attemptsResult.isFailure) {
        return Result.fail(attemptsResult.error)
      }
    }

    // Save to repository
    const savedResult = await this.quizRepository.save(quiz)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const quizDTO = quizMapper.toDTO(savedResult.value)

    return Result.ok(quizDTO)
  }
}
