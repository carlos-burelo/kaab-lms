/**
 * Get Quiz Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { EntityNotFoundError } from '@/core/shared/errors';
import type { IQuizRepository } from '../../domain/quiz.repository.interface';
import { type QuizDTO, quizMapper } from '../../infrastructure/quiz.mapper';

interface GetQuizRequest {
  quizId: string;
  currentUserId: string;
}

export class GetQuizUseCase extends BaseUseCase<GetQuizRequest, QuizDTO> {
  constructor(private quizRepository: IQuizRepository) {
    super();
  }

  async execute(request: GetQuizRequest): Promise<Result<QuizDTO>> {
    const { quizId } = request;

    // Find quiz
    const quizResult = await this.quizRepository.findByIdWithQuestions(quizId);

    if (quizResult.isFailure) {
      return Result.fail(quizResult.error);
    }

    if (!quizResult.value) {
      return Result.fail(new EntityNotFoundError('Quiz', quizId));
    }

    // Map to DTO
    const quizDTO = quizMapper.toDTO(quizResult.value);

    return Result.ok(quizDTO);
  }
}
