/**
 * Create Quiz Use Case
 */

import { DuplicateEntityError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { Quiz } from '../../domain/quiz.entity'
import type { IQuizRepository } from '../../domain/quiz.repository.interface'
import { type QuizDTO, quizMapper } from '../../infrastructure/quiz.mapper'
import type { CreateQuizDTO } from '../dtos'

interface CreateQuizRequest {
  dto: CreateQuizDTO
  currentUserId: string
}

export class CreateQuizUseCase extends BaseUseCase<CreateQuizRequest, QuizDTO> {
  constructor(private quizRepository: IQuizRepository) {
    super()
  }

  async execute(request: CreateQuizRequest): Promise<Result<QuizDTO>> {
    const { dto } = request

    // Check if lesson already has a quiz
    const lessonHasQuizResult = await this.quizRepository.lessonHasQuiz(dto.lessonId)

    if (lessonHasQuizResult.isFailure) {
      return Result.fail(lessonHasQuizResult.error)
    }

    if (lessonHasQuizResult.value) {
      return Result.fail(new DuplicateEntityError('Quiz', 'lessonId', dto.lessonId))
    }

    // Create quiz entity
    const quizResult = Quiz.create({
      title: dto.title,
      description: dto.description,
      instructions: dto.instructions,
      lessonId: dto.lessonId,
      durationMinutes: dto.durationMinutes,
      passingScore: dto.passingScore,
      maxAttempts: dto.maxAttempts,
      showAnswers: dto.showAnswers,
      shuffleQuestions: dto.shuffleQuestions
    })

    if (quizResult.isFailure) {
      return Result.fail(quizResult.error)
    }

    // Save to repository
    const savedResult = await this.quizRepository.save(quizResult.value)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const quizDTO = quizMapper.toDTO(savedResult.value)

    return Result.ok(quizDTO)
  }
}
