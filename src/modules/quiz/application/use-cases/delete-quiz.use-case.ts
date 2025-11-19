/**
 * Delete Quiz Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { EntityNotFoundError, ForbiddenError } from '@/core/shared/errors';
import type { IQuizRepository } from '../../domain/quiz.repository.interface';

interface DeleteQuizRequest {
  quizId: string;
  currentUserId: string;
}

export class DeleteQuizUseCase extends BaseUseCase<DeleteQuizRequest, void> {
  constructor(private quizRepository: IQuizRepository) {
    super();
  }

  async execute(request: DeleteQuizRequest): Promise<Result<void>> {
    const { quizId } = request;

    // Check if quiz exists
    const existsResult = await this.quizRepository.exists(quizId);

    if (existsResult.isFailure) {
      return Result.fail(existsResult.error);
    }

    if (!existsResult.value) {
      return Result.fail(new EntityNotFoundError('Quiz', quizId));
    }

    // Delete quiz
    const deleteResult = await this.quizRepository.delete(quizId);

    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error);
    }

    return Result.ok(undefined);
  }
}
